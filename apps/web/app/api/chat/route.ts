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
} from "ai";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Tools } from "@/lib/AITools/index";
import { buildSystemPrompt, type ProjectContext } from "@/lib/ai_context";
import { supermemoryTools, withSupermemory } from "@supermemory/tools/ai-sdk";
import { ModeMapping } from "@/lib/AITools/ModeMapping";
import type { ModeName } from "@/lib/AITools/ModePrompts";

const getFirstUserText = (messages: UIMessage[]) => {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return "";
  return firstUser.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
};

const getTrimmedTitle = (text: string) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Untitled chat";
  return cleaned.length > 60 ? `${cleaned.slice(0, 60)}...` : cleaned;
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
  let messages: UIMessage[];
  let messageId: string | undefined;
  let userId: string | undefined;
  let projectId: Id<"projects"> | undefined;
  let mode: string;
  try {
    const body = await req.json();
    model = body.model;
    threadId = body.id;
    messages = body.messages;
    messageId = body.messageId;
    userId = body.userId;
    projectId = body.projectId || undefined;
    mode = body.mode || "Basic";
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
    { mode: "full", apiKey: process.env.SUPERMEMORY_API_KEY! },
  );

  if (
    !threadId ||
    !Array.isArray(messages) ||
    !model ||
    typeof userId !== "string"
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let thread = await fetchQuery(api.chat.getThread, { threadId }, { token });

  if (!thread) {
    const title = getTrimmedTitle(getFirstUserText(messages));
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

  const lastMessage =
    messages.find((msg) => msg.id === messageId) ??
    messages[messages.length - 1];

  if (lastMessage?.role === "user") {
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

  const modelMessages = await convertToModelMessages(messages);
  const cleanedMessages = pruneMessages({ messages: modelMessages, reasoning: "before-last-message", toolCalls: "before-last-2-messages", emptyMessages: "remove" });

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

  // Get the active tools for the model
  const activeTools = ModeMapping[mode].activeTools;

  // Build system instructions with project context and mode
  const instructions = buildSystemPrompt(
    projectContext ?? undefined,
    mode as ModeName,
  );

  const response = createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const agent = new Agent({
          model: modelWithMemory,
          instructions,
          stopWhen: stepCountIs(10),
          experimental_context: {
            threadId,
            userId,
            token,
          },
          tools: {
            ...Tools,
            ...(supermemoryTools(process.env.SUPERMEMORY_API_KEY!, {
              containerTags: [userId],
            }) as unknown as typeof Tools),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          activeTools: activeTools as any,
        });

        const stream = await agent.stream({ messages: cleanedMessages });
        writer.merge(
          stream.toUIMessageStream({
            onFinish: async ({ messages: streamedMessages }) => {
              if (!streamedMessages.length) {
                console.error("No messages returned from agent");
                return;
              }

              const agentMessage =
                streamedMessages[streamedMessages.length - 1];
              try {
                await fetchMutation(
                  api.chat.appendMessage,
                  {
                    threadId,
                    model,
                    messageId: crypto.randomUUID(),
                    role: "assistant",
                    parts: agentMessage.parts,
                  },
                  { token },
                );
              } catch (error) {
                console.error("Error appending assistant message:", error);
              }
            },
          }),
        );
      },
    }),
  });
  return response;
}
