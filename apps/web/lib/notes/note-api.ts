import { ConvexHttpClient } from "convex/browser"
import { lexicalJsonToMarkdown, markdownToPlainText } from "@/lib/notes/lexical-markdown"

export function createConvexClient(token: string) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL")
  }

  const client = new ConvexHttpClient(url)
  client.setAuth(token)
  return client
}

export function getNoteMarkdown(note: { content?: string; contentText?: string }) {
  try {
    const markdown = lexicalJsonToMarkdown(note.content ?? "")
    return markdown.trim()
  } catch {
    return note.contentText?.trim() ?? ""
  }
}

export function getNoteText(note: { content?: string; contentText?: string }) {
  const markdown = getNoteMarkdown(note)
  return note.contentText?.trim() || markdownToPlainText(markdown)
}
