import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGroq } from "@ai-sdk/groq";
import { createCerebras } from "@ai-sdk/cerebras";
import {
  stepCountIs,
  ToolLoopAgent as Agent,
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  type UIMessage,
  pruneMessages,
  generateText,
} from "ai";
import {
  safeParseUIMessages,
  normalizeUIMessages,
  getInitialUserText,
  getLatestUserMessage,
} from "@taskflow/context-compaction";
import { pipeJsonRender } from "@json-render/core";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Tools } from "@/lib/AITools/index";
import { buildSystemPrompt, type ProjectContext } from "@/lib/ai_context";
import { supermemoryTools, withSupermemory } from "@supermemory/tools/ai-sdk";
import { getActiveToolsForMode } from "@/lib/AITools/ModeMapping";
import type { ModeName } from "@/lib/AITools/ModePrompts";
import { getChatGenUISystemPrompt } from "@/lib/genui/chat-prompt";
import {
  convertStoredMessages,
  runCompactionPipeline,
  buildContextMessages,
  assembleContext,
} from "@/lib/chat/compaction";
import { MAX_AGENT_OUTPUT_TOKENS } from "@/lib/ai/models";

type ActiveAgentStream = {
  totalUsage: Promise<{
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  }>;
};

type ChatRequestBody = {
  model?: string;
  interface?: string;
  id?: string;
  messages?: unknown;
  messageId?: string;
  userId?: string;
  projectId?: Id<"projects">;
  mode?: string;
  toolLock?: string;
  compactManually?: boolean;
};

const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

const createTitle = async (messages: UIMessage[]) => {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  if (!openRouter) {
    console.error("OpenRouter not initialized in createTitle");
    return "";
  }

  const initialMessage = getInitialUserText(messages);

  const { text } = await generateText({
    model: openRouter("arcee-ai/trinity-large-preview:free", {
      extraBody: {
        models: [
          "arcee-ai/trinity-large-preview:free",
          "openrouter/aurora-alpha",
        ],
      },
    }),
    system:
      "You are a title generation agent. You are tasked with generating a title for a conversation based on the initial message.",
    prompt: `Generate a title for a conversation based on the initial message: ${initialMessage}.
    The title should be a single sentence and should be no more than 100 characters.
    You must return text.`,
    temperature: 0.9,
    maxRetries: 2,
  });
  return text;
};

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  if (!openRouter) {
    console.error("OpenRouter not initialized");
    return jsonError("OpenRouter not initialized", 500);
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Error parsing request:", error);
    return jsonError("Invalid request", 400);
  }

  const {
    model,
    interface: rawInterface,
    id: threadId,
    messages: rawMessages,
    messageId,
    userId,
    projectId: rawProjectId,
    mode: rawMode,
    toolLock: rawToolLock,
    compactManually = false,
  } = body;
  const modelInterface = rawInterface || undefined;
  const projectId = rawProjectId || undefined;
  const mode = rawMode || "Basic";
  const toolLock = rawToolLock || undefined;

  if (!userId) {
    return jsonError("User ID is required", 400);
  }

  // Creation of the supermemory tools
  if (!process.env.SUPERMEMORY_API_KEY) {
    return jsonError("SuperMemory API key is required", 400);
  }

  if (
    !threadId ||
    !Array.isArray(rawMessages) ||
    !model ||
    typeof userId !== "string"
  ) {
    return jsonError("Invalid request", 400);
  }

  const modelDoc = await fetchQuery(
    api.models.getModelByIdAndProvider,
    { modelId: model, interface: modelInterface },
    { token },
  );
  const interfaceType = modelDoc?.interface ?? "openrouter";

  let baseModel;
  switch (interfaceType) {
    case "groq": {
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      if (!groq) {
        return NextResponse.json(
          { error: "Groq not initialized" },
          { status: 500 },
        );
      }
      baseModel = groq(model);
      break;
    }
    case "cerebras": {
      const cerebras = createCerebras({ apiKey: process.env.CEREBRAS_API_KEY });
      if (!cerebras) {
        return NextResponse.json(
          { error: "Cerebras not initialized" },
          { status: 500 },
        );
      }
      baseModel = cerebras(model);
      break;
    }
    case "openrouter":
      baseModel = openRouter(model, {
        reasoning: { enabled: true, effort: "medium" },
        parallelToolCalls: true,
        usage: { include: true },
      });
      break
    case "vercel": {
      baseModel = model;
      break;
    }
    default: {
      baseModel = openRouter(model, {
        reasoning: { enabled: true, effort: "medium" },
        parallelToolCalls: true,
        usage: { include: true },
      });
      break;
    }
  }

  const modelWithMemory = withSupermemory(baseModel, userId, {
    addMemory: "always",
    mode: "profile",
    apiKey: process.env.SUPERMEMORY_API_KEY!,
  });

  const parsedMessages = safeParseUIMessages(rawMessages);
  if (!parsedMessages.success) {
    return NextResponse.json(
      { error: "Invalid messages payload" },
      { status: 400 },
    );
  }
  const clientMessages = normalizeUIMessages(parsedMessages.data);

  let thread = await fetchQuery(api.chat.getThread, { threadId }, { token });

  if (!thread) {
    const title = await createTitle(clientMessages);
    try {
      thread = await fetchMutation(
        api.chat.createThread,
        {
          threadId,
          title,
          model,
          interface: modelInterface,
          projectId,
          scope: projectId ? "project" : "workspace",
        },
        { token },
      );
    } catch (error) {
      console.error("Error creating thread:", error);
      return NextResponse.json(
        { error: "Error creating thread" },
        { status: 500 },
      );
    }
  }

  const lastMessage = getLatestUserMessage(clientMessages, messageId);

  if (lastMessage) {
    try {
      await fetchMutation(
        api.chat.appendMessage,
        {
          threadId,
          model,
          messageId: lastMessage.id,
          role: "user",
          parts: lastMessage.parts,
        },
        { token },
      );
      await fetchMutation(
        api.chat.setThreadModel,
        { threadId, model, interface: modelInterface },
        { token },
      );
    } catch (error) {
      console.error("Error appending user message:", error);
      return NextResponse.json(
        { error: "Error appending message to thread" },
        { status: 500 },
      );
    }
  }

  const storedMessages = await fetchQuery(
    api.chat.listMessages,
    { threadId },
    { token },
  )
  const threadMessages = convertStoredMessages(storedMessages)

  const existingSummary = thread && "summary" in thread ? thread.summary : undefined

  let summaryTextForContext = existingSummary?.summaryText ?? ""
  let threadStateForContext = existingSummary?.threadState ?? null
  let messagesForModelContext = buildContextMessages({
    messages: threadMessages,
    existingSummary,
  })

  try {
    const compactionResult = await runCompactionPipeline({
      threadId,
      messages: threadMessages,
      existingSummary,
      forceManual: compactManually,
      token,
    })

    if (compactionResult) {
      summaryTextForContext = compactionResult.summaryText
      threadStateForContext = compactionResult.threadState
      messagesForModelContext = compactionResult.messagesForContext
    }
  } catch (error) {
    console.error("Context compaction failed:", error)
  }

  messagesForModelContext = assembleContext({
    summaryText: summaryTextForContext,
    threadState: threadStateForContext,
    messagesToKeep: messagesForModelContext,
  })

  const modelMessages = await convertToModelMessages(messagesForModelContext);
  const cleanedMessages = pruneMessages({
    messages: modelMessages,
    reasoning: "before-last-message",
    toolCalls: "before-last-2-messages",
    emptyMessages: "remove",
  });

  // Fetch project context if projectId is provided
  let projectContext: ProjectContext | null = null;
  if (projectId) {
    try {
      projectContext = await fetchQuery(
        api.projects.getProjectContext,
        { projectId },
        { token },
      );
    } catch (error) {
      console.error("Error fetching project context:", error);
    }
  }

  const selectedMode = mode;
  const hasDaytonaRepo = Boolean(thread?.daytona?.repoUrl)
  const activeToolsForMode = getActiveToolsForMode(selectedMode, {
    includeDaytonaTools: hasDaytonaRepo,
  })
  const validatedToolLock =
    typeof toolLock === "string" &&
      toolLock.length > 0 &&
      Object.prototype.hasOwnProperty.call(Tools, toolLock) &&
      activeToolsForMode.includes(toolLock as keyof typeof Tools)
      ? (toolLock as keyof typeof Tools)
      : null;
  const activeTools = validatedToolLock
    ? [validatedToolLock]
    : activeToolsForMode;

  const instructionSections = [
    buildSystemPrompt(
      projectContext ?? undefined,
      selectedMode as ModeName,
      undefined,
      thread?.daytona?.repoUrl
        ? {
            repoUrl: thread.daytona.repoUrl,
            status: thread.daytona.status,
          }
        : undefined,
    ),
  ];

  if (validatedToolLock) {
    instructionSections.push(`## Tool Lock (User Selected)
- Tool usage is locked to \`${validatedToolLock}\`
- Only use this tool for tool calls in this response
- If this tool cannot complete the request, explain the limitation and ask the user to clear the tool lock or choose another slash command`);
  }

  instructionSections.push(getChatGenUISystemPrompt());
  const instructions = instructionSections.join("\n\n");

  let activeAgentStream: ActiveAgentStream | null = null;

  const response = createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      onFinish: async ({ responseMessage, isAborted }) => {
        if (isAborted) {
          return;
        }

        let usagePayload:
          | {
            inputTokens: number;
            outputTokens: number;
            totalTokens?: number;
          }
          | undefined;

        try {
          const totalUsage = await activeAgentStream?.totalUsage;
          if (totalUsage) {
            usagePayload = {
              inputTokens: totalUsage.inputTokens ?? 0,
              outputTokens: totalUsage.outputTokens ?? 0,
              totalTokens:
                totalUsage.totalTokens ??
                (totalUsage.inputTokens ?? 0) + (totalUsage.outputTokens ?? 0),
            };
          }
        } catch (error) {
          console.error("Error reading stream usage:", error);
        }

        try {
          await fetchMutation(
            api.chat.appendMessage,
            {
              threadId,
              model,
              messageId: responseMessage.id,
              role: "assistant",
              parts: responseMessage.parts,
              usage: usagePayload,
            },
            { token },
          );
        } catch (error) {
          console.error("Error appending assistant message:", error);
        }
      },
      execute: async ({ writer }) => {
        const agent = new Agent({
          model: interfaceType === "vercel" ? baseModel : modelWithMemory,
          instructions,
          stopWhen: stepCountIs(10),
          experimental_context: {
            threadId,
            userId,
            token,
            uiWriter: writer,
          },
          tools: {
            ...Tools,
            ...(supermemoryTools(process.env.SUPERMEMORY_API_KEY!, {
              containerTags: [userId],
            }) as unknown as typeof Tools),
          },
          maxOutputTokens: MAX_AGENT_OUTPUT_TOKENS,
          activeTools: activeTools as Array<keyof typeof Tools>,
        });

        const stream = await agent.stream({ messages: cleanedMessages });
        activeAgentStream = stream as unknown as ActiveAgentStream;
        const uiStream = stream.toUIMessageStream();

        writer.merge(pipeJsonRender(uiStream));
      },
    }),
  });
  return response;
}
