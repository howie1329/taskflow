import { NextResponse } from "next/server"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { ConvexHttpClient } from "convex/browser"
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
import { createEditor, $getRoot } from "lexical"
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListNode, ListItemNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { LinkNode, AutoLinkNode } from "@lexical/link"

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY,
})

const googleModel = googleProvider("gemini-3.1-flash-lite-preview")

type NoteContext = {
  noteId?: string
  title?: string
  contentText?: string
}

type ToolContext = {
  token: string
  noteId: string
}

const noteEditResultSchema = z.object({
  ok: z.boolean(),
  noteId: z.string(),
  updatedAt: z.number().optional(),
  reason: z.string().optional(),
  message: z.string().optional(),
})

function createClient(token: string) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL")
  }
  const client = new ConvexHttpClient(url)
  client.setAuth(token)
  return client
}

function createMarkdownEditor() {
  return createEditor({
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
    ],
    onError: (error) => {
      throw error
    },
  })
}

function markdownToLexicalJson(markdown: string) {
  const editor = createMarkdownEditor()
  let lexicalJson = ""

  editor.update(
    () => {
      const root = $getRoot()
      root.clear()
      $convertFromMarkdownString(markdown, TRANSFORMERS)
      lexicalJson = JSON.stringify(editor.getEditorState().toJSON())
    },
    { discrete: true },
  )

  if (!lexicalJson) {
    throw new Error("Failed to convert markdown to lexical json")
  }

  return lexicalJson
}

function markdownToPlainText(markdown: string) {
  const editor = createMarkdownEditor()
  let text = ""
  editor.update(
    () => {
      const root = $getRoot()
      root.clear()
      $convertFromMarkdownString(markdown, TRANSFORMERS)
      text = root.getTextContent().replace(/\s+/g, " ").trim()
    },
    { discrete: true },
  )

  return text
}

const getToolContext = (context: unknown): ToolContext => {
  if (!context || typeof context !== "object") {
    throw new Error("Missing tool context")
  }

  const { token, noteId } = context as ToolContext
  if (!token || !noteId) {
    throw new Error("Incomplete tool context")
  }

  return { token, noteId }
}

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let model: string
  let messages: UIMessage[]
  let noteContext: NoteContext | undefined
  let trigger: string | undefined
  try {
    const body = await req.json()
    model = body.model
    messages = body.messages
    noteContext = body.noteContext
    trigger = typeof body.trigger === "string" ? body.trigger : undefined
  } catch (error) {
    console.error("Error parsing note copilot request:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!model) {
    console.error("Note copilot request missing model", { trigger })
    return NextResponse.json({ error: "Missing model" }, { status: 400 })
  }

  if (!Array.isArray(messages)) {
    console.error("Note copilot request missing/invalid messages", { trigger })
    return NextResponse.json(
      { error: "Missing or invalid messages" },
      { status: 400 },
    )
  }

  if (!noteContext?.noteId) {
    console.error("Note copilot request missing note context noteId", {
      trigger,
    })
    return NextResponse.json(
      { error: "Missing note context noteId" },
      { status: 400 },
    )
  }

  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  })

  if (!openRouter) {
    return NextResponse.json(
      { error: "OpenRouter not initialized" },
      { status: 500 },
    )
  }

  const modelMessages = await convertToModelMessages(messages)
  const cleanedMessages = pruneMessages({
    messages: modelMessages,
    emptyMessages: "remove",
  })

  const noteTitle = noteContext.title?.trim() || "Untitled note"
  const noteText = (noteContext.contentText || "").slice(0, 10000)
  const instructions = `You are Note Copilot for Taskflow.
You assist with exactly one note and can optionally apply edits with a tool.

Guidelines:
- Keep responses concise and actionable.
- Use bullets/checklists when useful.
- When preparing edits, output clean markdown (paragraphs, headings, and lists).
- Only call applyCurrentNoteEdit when the user clearly wants the note changed.
- For rewrite/edit requests, prepare the complete updated content and call applyCurrentNoteEdit.
- For summarize/explain requests, respond directly without tool calls.

Current note title: ${noteTitle}
Current note content:
${noteText || "(empty note)"}`

  const noteTools = {
    applyCurrentNoteEdit: tool({
      description:
        "Apply a full content/title edit to the current note in this session. Use only for explicit user-approved note modifications.",
      inputSchema: z.object({
        title: z.string().optional(),
        content: z.string(),
      }),
      outputSchema: noteEditResultSchema,
      needsApproval: true,
      execute: async ({ title, content }, { experimental_context }) => {
        const { token, noteId } = getToolContext(experimental_context)
        const client = createClient(token)

        const currentNote = await client.query(api.notes.getMyNote, {
          noteId: noteId as Id<"notes">,
        })

        if (!currentNote) {
          return {
            ok: false,
            noteId,
            reason: "NOTE_NOT_FOUND",
            message: "The note could not be found or is not accessible.",
          }
        }

        try {
          const lexicalJsonContent = markdownToLexicalJson(content)
          const contentText = markdownToPlainText(content)
          const nextTitle =
            title !== undefined ? title : (currentNote.title ?? "Untitled note")

          const updatedNote = await client.mutation(api.notes.updateNote, {
            noteId: noteId as Id<"notes">,
            title: nextTitle,
            content: lexicalJsonContent,
            contentText,
          })

          return {
            ok: true,
            noteId,
            updatedAt: updatedNote?.updatedAt,
            message: "Note updated successfully.",
          }
        } catch (error) {
          console.error("Failed to update note from copilot tool:", error)
          return {
            ok: false,
            noteId,
            reason: "UPDATE_FAILED",
            message: "Unable to convert and save note content right now.",
          }
        }
      },
    }),
  } as const

  const buildAgent = (agentModel: ReturnType<typeof openRouter> | typeof googleModel) =>
    new Agent({
      model: agentModel,
      instructions,
      stopWhen: stepCountIs(4),
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
        try {
          const primaryAgent = buildAgent(googleModel)
          const primaryStream = await primaryAgent.stream({
            messages: cleanedMessages,
          })
          writer.merge(primaryStream.toUIMessageStream())
        } catch (primaryError) {
          console.error("Note copilot primary model failed:", primaryError)
          const fallbackAgent = buildAgent(openRouter(model))
          const fallbackStream = await fallbackAgent.stream({
            messages: cleanedMessages,
          })
          writer.merge(fallbackStream.toUIMessageStream())
        }
      },
    }),
  })
}
