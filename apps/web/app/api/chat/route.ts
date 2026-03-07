import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
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
  planSummarization,
  formatMessagesForSummarizer,
  injectRollingSummary,
} from "@taskflow/chat-content";
import { pipeJsonRender } from "@json-render/core";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Tools } from "@/lib/AITools/index";
import { buildSystemPrompt, type ProjectContext } from "@/lib/ai_context";
import { supermemoryTools, withSupermemory } from "@supermemory/tools/ai-sdk";
import { ModeMapping } from "@/lib/AITools/ModeMapping";
import type { ModeName } from "@/lib/AITools/ModePrompts";
import { getChatGenUISystemPrompt } from "@/lib/genui/chat-prompt";

const CHAT_SUMMARIZATION_OPTIONS = {
  trigger: { kind: "either", maxTokens: 20000, maxMessages: 20 } as const,
  keepLastN: 8,
  includeToolText: false,
  maxCharsPerMessage: 8000,
};

const ROLLING_SUMMARY_OPTIONS = {
  maxSummaryChars: 2800,
  maxTranscriptChars: 12000,
  minTranscriptChars: 180,
} as const;

const chatApiWithSummary = api as typeof api & {
  chat: typeof api.chat & {
    setThreadSummary: unknown
  }
}

const fetchMutationUnsafe = fetchMutation as unknown as (
  mutationRef: unknown,
  args: unknown,
  options: { token: string },
) => Promise<unknown>

type ActiveAgentStream = {
  totalUsage: Promise<{
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  }>;
};

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

const createRollingSummary = async ({
  openRouter,
  previousSummary,
  transcript,
}: {
  openRouter: ReturnType<typeof createOpenRouter>;
  previousSummary: string;
  transcript: string;
}) => {
  const boundedPreviousSummary = previousSummary
    .trim()
    .slice(0, ROLLING_SUMMARY_OPTIONS.maxSummaryChars);
  const boundedTranscript = transcript
    .trim()
    .slice(-ROLLING_SUMMARY_OPTIONS.maxTranscriptChars);

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
      "You maintain a rolling conversation summary used for context compression. Keep it concise, factual, action-oriented, and durable across long chats.",
    prompt: `Update the rolling summary.

Return plain markdown using this structure:
- **User profile & preferences**
- **Decisions & outcomes**
- **Open tasks & unresolved questions**
- **Active context for next reply**

Rules:
- Keep only information still useful for future turns.
- Remove stale or resolved items.
- Prefer short bullets over prose.
- Never include tool JSON dumps or verbose logs.
- Keep the full summary under ${ROLLING_SUMMARY_OPTIONS.maxSummaryChars} characters.

Existing summary:
${boundedPreviousSummary || "None"}

New transcript segment:
${boundedTranscript}

Return only the updated markdown summary.`,
    temperature: 0.2,
    maxRetries: 3,
  });

  return text.trim().slice(0, ROLLING_SUMMARY_OPTIONS.maxSummaryChars);
};

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  if (!openRouter) {
    console.error("OpenRouter not initialized");
    return NextResponse.json(
      { error: "OpenRouter not initialized" },
      { status: 500 },
    );
  }

  let model: string;
  let threadId: string;
  let rawMessages: unknown;
  let messageId: string | undefined;
  let userId: string | undefined;
  let projectId: Id<"projects"> | undefined;
  let mode: string;
  let toolLock: string | undefined;
  try {
    const body = await req.json();
    model = body.model;
    threadId = body.id;
    rawMessages = body.messages;
    messageId = body.messageId;
    userId = body.userId;
    projectId = body.projectId || undefined;
    mode = body.mode || "Basic";
    toolLock = body.toolLock || undefined;
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Creation of the supermemory tools
  if (!process.env.SUPERMEMORY_API_KEY) {
    return NextResponse.json(
      { error: "SuperMemory API key is required" },
      { status: 400 },
    );
  }

  const modelWithMemory = withSupermemory(
    openRouter(model, {
      reasoning: { enabled: true, effort: "medium" },
      parallelToolCalls: true,
      usage: {
        include: true,
      },
    }),
    userId,
    {
      addMemory: "always",
      mode: "profile",
      apiKey: process.env.SUPERMEMORY_API_KEY!,
    },
  );

  if (
    !threadId ||
    !Array.isArray(rawMessages) ||
    !model ||
    typeof userId !== "string"
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsedMessages = safeParseUIMessages(rawMessages);
  if (!parsedMessages.success) {
    return NextResponse.json(
      { error: "Invalid messages payload" },
      { status: 400 },
    );
  }
  const messages = normalizeUIMessages(parsedMessages.data);

  let thread = await fetchQuery(api.chat.getThread, { threadId }, { token });

  if (!thread) {
    const title = await createTitle(messages);
    try {
      thread = await fetchMutation(
        api.chat.createThread,
        {
          threadId,
          title,
          model,
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

  const lastMessage = getLatestUserMessage(messages, messageId);

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
    } catch (error) {
      console.error("Error appending user message:", error);
      return NextResponse.json(
        { error: "Error appending message to thread" },
        { status: 500 },
      );
    }
  }

  const existingSummary =
    thread && "summary" in thread
      ? (thread.summary as
          | {
              schemaVersion: number;
              summaryText: string;
              summarizedThroughMessageId: string;
              updatedAt: number;
            }
          | undefined)
      : undefined;

  const summaryPlan = planSummarization({
    messages,
    previousSummary: existingSummary
      ? {
          schemaVersion: 1,
          summaryText: existingSummary.summaryText,
          summarizedThroughMessageId:
            existingSummary.summarizedThroughMessageId,
          updatedAt: existingSummary.updatedAt,
        }
      : null,
    options: CHAT_SUMMARIZATION_OPTIONS,
  });

  let summaryTextForContext = existingSummary?.summaryText ?? "";
  let messagesForModelContext = messages;

  if (summaryPlan.shouldSummarize && summaryPlan.nextCursorMessageId) {
    const transcript = formatMessagesForSummarizer(
      summaryPlan.messagesToSummarize,
      CHAT_SUMMARIZATION_OPTIONS,
    );

    if (transcript.length >= ROLLING_SUMMARY_OPTIONS.minTranscriptChars) {
      try {
        const updatedSummary = await createRollingSummary({
          openRouter,
          previousSummary: summaryTextForContext,
          transcript,
        });

        if (updatedSummary) {
          await fetchMutationUnsafe(
            // Convex generated types may lag behind schema changes in CI/local restricted environments.
            chatApiWithSummary.chat.setThreadSummary,
            {
              threadId,
              summary: {
                schemaVersion: 1,
                summaryText: updatedSummary,
                summarizedThroughMessageId: summaryPlan.nextCursorMessageId,
                updatedAt: Date.now(),
              },
            },
            { token },
          );
          summaryTextForContext = updatedSummary;
          messagesForModelContext = summaryPlan.messagesToKeep;
        }
      } catch (error) {
        console.error("Error creating rolling summary:", error);
      }
    }
  }

  if (summaryTextForContext) {
    messagesForModelContext = injectRollingSummary({
      summaryText: summaryTextForContext,
      messagesToKeep: messagesForModelContext,
    });
  }

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

  const selectedMode = ModeMapping[mode] ? mode : "Basic";

  // Get the active tools for the model
  let activeTools = ModeMapping[selectedMode].activeTools;
  let validatedToolLock: keyof typeof Tools | null = null;

  if (typeof toolLock === "string" && toolLock.length > 0) {
    const isKnownTool = Object.prototype.hasOwnProperty.call(Tools, toolLock);
    const isAllowedInMode = activeTools.includes(
      toolLock as keyof typeof Tools,
    );

    if (isKnownTool && isAllowedInMode) {
      validatedToolLock = toolLock as keyof typeof Tools;
      activeTools = [validatedToolLock];
    }
  }

  // Build system instructions with project context and mode
  let instructions = buildSystemPrompt(
    projectContext ?? undefined,
    selectedMode as ModeName,
  );

  if (validatedToolLock) {
    instructions = `${instructions}

## Tool Lock (User Selected)
- Tool usage is locked to \`${validatedToolLock}\`
- Only use this tool for tool calls in this response
- If this tool cannot complete the request, explain the limitation and ask the user to clear the tool lock or choose another slash command`;
  }

  instructions = `${instructions}

${getChatGenUISystemPrompt()}`;

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
          model: modelWithMemory,
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
          maxOutputTokens: 4500, // Balanced default to reduce runaway completions
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
