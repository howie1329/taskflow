import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  ToolLoopAgent as Agent,
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  type UIMessage,
} from "ai";

type NoteContext = {
  noteId?: string;
  title?: string;
  contentText?: string;
};

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let model: string;
  let messages: UIMessage[];
  let noteContext: NoteContext | undefined;
  try {
    const body = await req.json();
    model = body.model;
    messages = body.messages;
    noteContext = body.noteContext;
  } catch (error) {
    console.error("Error parsing note copilot request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!model || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Missing model or messages" }, { status: 400 });
  }

  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  if (!openRouter) {
    return NextResponse.json(
      { error: "OpenRouter not initialized" },
      { status: 500 },
    );
  }

  const modelMessages = await convertToModelMessages(messages);
  const cleanedMessages = pruneMessages({
    messages: modelMessages,
    emptyMessages: "remove",
  });

  const noteTitle = noteContext?.title?.trim() || "Untitled note";
  const noteText = (noteContext?.contentText || "").slice(0, 10000);

  const instructions = `You are Note Copilot for Taskflow.
Help users improve and think through a single note.

Guidelines:
- Keep responses concise and actionable.
- Prefer structured output (bullets/checklists) when useful.
- If asked to rewrite, return an improved draft.
- If information is missing, ask one clear follow-up question.

Current note title: ${noteTitle}
Current note content:
${noteText || "(empty note)"}`;

  return createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const agent = new Agent({
          model: openRouter(model),
          instructions,
          stopWhen: stepCountIs(1),
          tools: {},
        });

        const stream = await agent.stream({ messages: cleanedMessages });
        writer.merge(stream.toUIMessageStream());
      },
    }),
  });
}
