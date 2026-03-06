import { createEditor, $getRoot } from "lexical"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  CODE,
  HEADING,
  INLINE_CODE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  UNORDERED_LIST,
} from "@lexical/markdown"

export const NOTE_EDITOR_NODES = [
  ListNode,
  ListItemNode,
  HeadingNode,
  QuoteNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
]

export const NOTE_MARKDOWN_TRANSFORMERS = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CODE,
  INLINE_CODE,
  LINK,
]

function createMarkdownEditor() {
  return createEditor({
    nodes: NOTE_EDITOR_NODES,
    onError: (error) => {
      throw error
    },
  })
}

export function markdownToLexicalJson(markdown: string) {
  const editor = createMarkdownEditor()
  let lexicalJson = ""

  editor.update(
    () => {
      const root = $getRoot()
      root.clear()
      $convertFromMarkdownString(markdown, NOTE_MARKDOWN_TRANSFORMERS)
      lexicalJson = JSON.stringify(editor.getEditorState().toJSON())
    },
    { discrete: true },
  )

  if (!lexicalJson) {
    throw new Error("Failed to convert markdown to lexical json")
  }

  return lexicalJson
}

export function markdownToPlainText(markdown: string) {
  const editor = createMarkdownEditor()
  let text = ""

  editor.update(
    () => {
      const root = $getRoot()
      root.clear()
      $convertFromMarkdownString(markdown, NOTE_MARKDOWN_TRANSFORMERS)
      text = root.getTextContent()
    },
    { discrete: true },
  )

  return text
}

export function lexicalJsonToMarkdown(serializedState: string) {
  if (!serializedState?.trim()) {
    return ""
  }

  const editor = createMarkdownEditor()
  const editorState = editor.parseEditorState(serializedState)
  editor.setEditorState(editorState)

  let markdown = ""
  editorState.read(() => {
    markdown = $convertToMarkdownString(NOTE_MARKDOWN_TRANSFORMERS)
  })

  return markdown
}
