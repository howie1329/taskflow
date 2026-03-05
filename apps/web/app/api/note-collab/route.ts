import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";

const collabSuggestionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  detail: z.string().min(1),
  kind: z.enum(["clarity", "structure", "action_items"]),
  confidence: z.number().min(0).max(1),
});

const collabResponseSchema = z.object({
  summary: z.string().default(""),
  suggestions: z.array(collabSuggestionSchema).max(5).default([]),
  actionItems: z.array(z.string().min(1)).max(8).default([]),
});

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

  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  if (!openRouter) {
    return NextResponse.json(
      { error: "OpenRouter not initialized" },
      { status: 500 },
    );
  }

  let model: string;
  let noteContext: NoteContext | undefined;
  try {
    const body = await req.json();
    model = body.model;
    noteContext = body.noteContext;
  } catch (error) {
    console.error("Error parsing note collab request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!model || !noteContext) {
    return NextResponse.json(
      { error: "Missing model or note context" },
      { status: 400 },
    );
  }

  const noteTitle = noteContext.title?.trim() || "Untitled note";
  const noteText = (noteContext.contentText || "").slice(0, 10000);

  const { text } = await generateText({
    model: openRouter(model),
    temperature: 0.2,
    maxRetries: 2,
    system: `You are Note Collaborator for Taskflow.
Return practical writing and productivity suggestions for one note.
You must return strict JSON only. No markdown fences.`,
    prompt: `Analyze the note and return JSON with this exact shape:
{
  "summary": "short summary",
  "suggestions": [
    {
      "id": "stable-id",
      "title": "short suggestion title",
      "detail": "specific actionable detail",
      "kind": "clarity" | "structure" | "action_items",
      "confidence": 0..1
    }
  ],
  "actionItems": ["item one", "item two"]
}

Rules:
- At most 5 suggestions
- At most 8 actionItems
- Keep suggestions concise and actionable
- Base output only on the provided note

Note title: ${noteTitle}
Note content:
${noteText || "(empty note)"}`,
  });

  const parsedJson = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  })();

  const validated = collabResponseSchema.safeParse(parsedJson);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid model response for note collab" },
      { status: 502 },
    );
  }

  return NextResponse.json(validated.data, { status: 200 });
}
