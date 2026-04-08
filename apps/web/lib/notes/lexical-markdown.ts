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
  TRANSFORMERS,
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

type LexicalRootShape = {
  children?: unknown[]
  [key: string]: unknown
}

type LexicalEditorStateShape = {
  root?: LexicalRootShape
  [key: string]: unknown
}

function createMarkdownEditor() {
  return createEditor({
    nodes: NOTE_EDITOR_NODES,
    onError: (error) => {
      throw error
    },
  })
}

export function markdownToLexicalJson(markdown: string) {
  return markdownToLexicalState(markdown).lexicalJson
}

export function markdownToPlainText(markdown: string) {
  return markdownToLexicalState(markdown).plainText
}

export function markdownToLexicalState(markdown: string) {
  const editor = createMarkdownEditor()
  let lexicalJson = ""
  let plainText = ""
  let hasMeaningfulContent = false

  editor.update(
    () => {
      const root = $getRoot()
      root.clear()
      $convertFromMarkdownString(markdown, TRANSFORMERS)
    },
    { discrete: true },
  )

  const editorState = editor.getEditorState()
  editorState.read(() => {
    const root = $getRoot()
    plainText = root.getTextContent()
    hasMeaningfulContent =
      root.getTextContent().trim().length > 0 || root.getChildrenSize() > 0
  })

  lexicalJson = JSON.stringify(editorState.toJSON())

  return {
    lexicalJson,
    plainText,
    hasMeaningfulContent,
  }
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

export function validateLexicalEditorState(serializedState: string) {
  if (!serializedState?.trim()) {
    return {
      isValid: false,
      hasMeaningfulContent: false,
    }
  }

  try {
    const parsed = JSON.parse(serializedState) as LexicalEditorStateShape
    const root = parsed.root
    const children = Array.isArray(root?.children) ? root.children : []

    return {
      isValid: !!root && Array.isArray(children),
      hasMeaningfulContent: children.length > 0,
    }
  } catch {
    return {
      isValid: false,
      hasMeaningfulContent: false,
    }
  }
}
