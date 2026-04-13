import { NextResponse } from "next/server"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateObject } from "ai"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  createReviewerSignature,
  noteReviewerResultSchema,
} from "@/lib/notes/reviewer"
import { createConvexClient, getNoteMarkdown, getNoteText } from "@/lib/notes/note-api"
import { COMPACTION_MODEL } from "@/lib/ai/models"

const REVIEWER_SCHEMA_VERSION = 1

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY,
})

const googleModel = googleProvider(COMPACTION_MODEL)

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as
    | { noteId?: string; signature?: string }
    | null

  if (!body?.noteId) {
    return NextResponse.json({ error: "Missing noteId" }, { status: 400 })
  }

  const client = createConvexClient(token)
  const note = await client.query(api.notes.getMyNote, {
    noteId: body.noteId as Id<"notes">,
  })

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }

  const noteTitle = note.title?.trim() || "Untitled note"
  const noteMarkdown = getNoteMarkdown(note)
  const noteText = getNoteText(note)
  const currentSignature = createReviewerSignature({
    title: noteTitle,
    contentText: noteText,
  })

  if (body.signature && body.signature !== currentSignature) {
    return NextResponse.json(
      { error: "Reviewer request is stale." },
      { status: 409 },
    )
  }

  if (note.reviewer?.contentSignature === currentSignature) {
    return NextResponse.json({
      ok: true,
      cached: true,
      reviewer: note.reviewer,
    })
  }

  const normalizedText = noteText.replace(/\s+/g, " ").trim()
  if (!normalizedText) {
    return NextResponse.json(
      { error: "Reviewer requires note content." },
      { status: 400 },
    )
  }

  const prompt = `You are the Taskflow Notes Reviewer.
Analyze the current note only. Return structured review output with no conversational filler.

Current note title: ${noteTitle}

Current note markdown:
${noteMarkdown || "(empty note)"}

Current note plain text:
${noteText || "(empty note)"}

Requirements:
- Write a concise summary of what the note is doing.
- Infer the note type with a short label such as meeting notes, brainstorm, spec draft, research note, or personal scratchpad.
- Score clarity, structure, scannability, and actionability from 1 to 5.
- Include at most 4 top issues. Each issue must be concrete and specific to this note.
- Include at most 5 suggestions. Each suggestion should be actionable and distinct.
- Extract action items only when they are supported by the note.
- Extract open questions only when they are actually unresolved in the note.
- Avoid generic advice. Ground every field in the note content.`

  try {
    const { object } = await generateObject({
      model: googleModel,
      schema: noteReviewerResultSchema,
      prompt,
    })

    const updatedAt = Date.now()
    const reviewer = {
      schemaVersion: REVIEWER_SCHEMA_VERSION,
      contentSignature: currentSignature,
      updatedAt,
      ...object,
    }

    await client.mutation(api.notes.setNoteReviewer, {
      noteId: body.noteId as Id<"notes">,
      reviewer,
    })

    return NextResponse.json({
      ok: true,
      cached: false,
      reviewer,
    })
  } catch (error) {
    console.error("Failed to generate note review:", error)
    return NextResponse.json(
      { error: "Failed to analyze note." },
      { status: 500 },
    )
  }
}
