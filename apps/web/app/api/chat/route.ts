import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  stepCountIs,
  ToolLoopAgent as Agent,
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Tools } from "@/lib/AITools/Tools";
import { buildSystemPrompt, type ProjectContext } from "@/lib/ai_context";

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

  try {
    const body = await req.json();
    model = body.model;
    threadId = body.id;
    messages = body.messages;
    messageId = body.messageId;
    userId = body.userId;
    projectId = body.projectId;
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

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

  // Build system instructions with project context
  const instructions = buildSystemPrompt(projectContext ?? undefined);

  const response = createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const agent = new Agent({
          model: openRouter.chat(model, {
            reasoning: { enabled: true, effort: "medium" },
            parallelToolCalls: true,
            usage: {
              include: true,
            },
          }),
          instructions,
          stopWhen: stepCountIs(10),
          experimental_context: {
            threadId,
            userId,
            token,
          },
          tools: Tools,
        });

        const stream = await agent.stream({ messages: modelMessages });
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
