import { NextResponse } from "next/server"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { tavily } from "@tavily/core"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  ToolLoopAgent as Agent,
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  tool,
  type UIMessage,
} from "ai"
import { z } from "zod"
import {
  markdownToLexicalState,
  validateLexicalEditorState,
} from "@/lib/notes/lexical-markdown"
import { createConvexClient, getNoteMarkdown, getNoteText } from "@/lib/notes/note-api"
import { COMPACTION_MODEL } from "@/lib/ai/models"

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY,
})

const googleModel = googleProvider(COMPACTION_MODEL)

const noteEditResultSchema = z.object({
  ok: z.boolean(),
  noteId: z.string(),
  updatedAt: z.number().optional(),
  reason: z.string().optional(),
  message: z.string().optional(),
})

const webSearchResultItemSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
})

const webSearchResultSchema = z.object({
  query: z.string(),
  reason: z.string().optional(),
  provider: z.enum(["tavily"]),
  results: z.array(webSearchResultItemSchema),
  message: z.string().optional(),
})

type NoteContext = {
  noteId?: string
  title?: string
}

type ToolContext = {
  token: string
  noteId: string
}

type SearchResponse = z.infer<typeof webSearchResultSchema>

function getToolContext(context: unknown): ToolContext {
  if (!context || typeof context !== "object") {
    throw new Error("Missing tool context")
  }

  const { token, noteId } = context as ToolContext
  if (!token || !noteId) {
    throw new Error("Incomplete tool context")
  }

  return { token, noteId }
}

async function searchWithTavily(query: string, reason?: string): Promise<SearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set")
  }

  const client = tavily({ apiKey })
  const response = await client.search(query)
  const results = Array.isArray(response.results)
    ? response.results.slice(0, 5).map((item) => ({
      title: item.title ?? item.url ?? "Untitled result",
      url: item.url,
      snippet: item.content ?? "No snippet available.",
    }))
    : []

  return webSearchResultSchema.parse({
    query,
    reason,
    provider: "tavily",
    results,
    message:
      results.length > 0
        ? `Found ${results.length} web results.`
        : "No web results found.",
  })
}

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let messages: UIMessage[]
  let noteContext: NoteContext | undefined

  try {
    const body = await req.json()
    messages = body.messages
    noteContext = body.noteContext
  } catch (error) {
    console.error("Error parsing note copilot request:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Missing or invalid messages" },
      { status: 400 },
    )
  }

  if (!noteContext?.noteId) {
    return NextResponse.json(
      { error: "Missing note context noteId" },
      { status: 400 },
    )
  }

  const client = createConvexClient(token)
  const currentNote = await client.query(api.notes.getMyNote, {
    noteId: noteContext.noteId as Id<"notes">,
  })

  if (!currentNote) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }

  const modelMessages = await convertToModelMessages(messages)
  const cleanedMessages = pruneMessages({
    messages: modelMessages,
    emptyMessages: "remove",
  })

  const noteTitle = currentNote.title?.trim() || noteContext.title?.trim() || "Untitled note"
  const noteMarkdown = getNoteMarkdown(currentNote)
  const noteText = getNoteText(currentNote)

  const instructions = `You are the Taskflow Notes Mini Chat.
You can only see the current note unless the user explicitly approves a web search.

Visible context right now:
- Current note title: ${noteTitle}
- Current note markdown:
${noteMarkdown || "(empty note)"}

- Current note plain text:
${noteText || "(empty note)"}

Behavior rules:
- Keep responses concise and useful inside a sidebar.
- Say what you are about to do before you request any tool approval.
- Only call replaceCurrentNote when the user clearly wants the note changed.
- When rewriting the note, produce complete markdown for the updated note body.
- Only call searchWebForNoteContext when the user asks for outside, current, or web information.
- If the user asks a question answerable from the note alone, respond directly without tools.
- Never imply you can see anything beyond the current note unless a search tool is approved.`

  const noteTools = {
    replaceCurrentNote: tool({
      description:
        "Replace the current note with a complete approved markdown rewrite. Use only when the user explicitly wants the note edited.",
      inputSchema: z.object({
        title: z.string().optional(),
        content: z.string().min(1).describe("The new note content in markdown format"),
      }),
      outputSchema: noteEditResultSchema,
      needsApproval: true,
      execute: async ({ title, content }, { experimental_context }) => {
        const { token: authToken, noteId } = getToolContext(experimental_context)
        const toolClient = createConvexClient(authToken)

        const note = await toolClient.query(api.notes.getMyNote, {
          noteId: noteId as Id<"notes">,
        })

        if (!note) {
          return {
            ok: false,
            noteId,
            reason: "NOTE_NOT_FOUND",
            message: "The note could not be found or is not accessible.",
          }
        }

        try {
          if (!content.trim()) {
            return {
              ok: false,
              noteId,
              reason: "EMPTY_MARKDOWN",
              message:
                "The note was not updated because the generated edit was empty.",
            }
          }

          const {
            lexicalJson,
            plainText,
            hasMeaningfulContent,
          } = markdownToLexicalState(content)
          const validation = validateLexicalEditorState(lexicalJson)

          if (!validation.isValid) {
            return {
              ok: false,
              noteId,
              reason: "INVALID_EDITOR_STATE",
              message:
                "The note was not updated because the generated edit could not be converted safely.",
            }
          }

          if (!hasMeaningfulContent || !validation.hasMeaningfulContent) {
            return {
              ok: false,
              noteId,
              reason: "EMPTY_CONVERSION",
              message:
                "The note was not updated because the generated edit converted to an empty document.",
            }
          }

          if (!plainText.trim()) {
            return {
              ok: false,
              noteId,
              reason: "EMPTY_TEXT_CONTENT",
              message:
                "The note was not updated because the generated edit did not produce any note text.",
            }
          }

          const updatedNote = await toolClient.mutation(api.notes.updateNote, {
            noteId: noteId as Id<"notes">,
            title: title !== undefined ? title : note.title,
            content: lexicalJson,
            contentText: plainText,
          })

          return {
            ok: true,
            noteId,
            updatedAt: updatedNote?.updatedAt,
            message: "Note updated successfully.",
          }
        } catch (error) {
          console.error("Failed to update note from mini chat:", error)
          return {
            ok: false,
            noteId,
            reason: "UPDATE_FAILED",
            message: "Unable to convert and save note content right now.",
          }
        }
      },
    }),
    searchWebForNoteContext: tool({
      description:
        "Search the web for outside context when the user explicitly asks for current or external information.",
      inputSchema: z.object({
        query: z.string().min(1),
        reason: z.string().optional(),
      }),
      outputSchema: webSearchResultSchema,
      execute: async ({ query, reason }) => {
        return await runBasicWebSearch(query, reason)
      },
    }),
  } as const

  const agent = new Agent({
    model: googleModel,
    instructions,
    stopWhen: stepCountIs(5),
    tools: noteTools,
    experimental_context: {
      token,
      noteId: noteContext.noteId,
    },
  })

  return createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const result = await agent.stream({
          messages: cleanedMessages,
        })

        writer.merge(result.toUIMessageStream())
      },
    }),
  })
}
