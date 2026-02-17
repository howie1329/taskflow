"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  type EditorState,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical"
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { Bold, Highlighter, Italic, List, ListOrdered, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const editorTheme = {
  paragraph: "text-sm leading-relaxed",
  list: {
    listitem: "ml-5 list-item",
    ul: "list-disc pl-5",
    ol: "list-decimal pl-5",
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    highlight: "bg-yellow-200/70 dark:bg-yellow-500/30 rounded-[2px]",
  },
}

type ToolbarState = {
  bold: boolean
  italic: boolean
  underline: boolean
  highlight: boolean
  bullet: boolean
  numbered: boolean
}

function getActiveListType() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return null

  let node = selection.anchor.getNode()
  while (node) {
    if ($isListNode(node)) {
      return node.getListType()
    }
    node = node.getParent()
  }

  return null
}

function NoteEditorToolbar({ className }: { className?: string }) {
  const [editor] = useLexicalComposerContext()
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    highlight: false,
    bullet: false,
    numbered: false,
  })

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const listType = getActiveListType()

    setToolbarState({
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      highlight: selection.hasFormat("highlight"),
      bullet: listType === "bullet",
      numbered: listType === "number",
    })
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          updateToolbar()
        })
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const toggleList = useCallback(
    (type: "bullet" | "number") => {
      if (type === "bullet") {
        editor.dispatchCommand(
          toolbarState.bullet
            ? REMOVE_LIST_COMMAND
            : INSERT_UNORDERED_LIST_COMMAND,
          undefined,
        )
        return
      }

      editor.dispatchCommand(
        toolbarState.numbered
          ? REMOVE_LIST_COMMAND
          : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      )
    },
    [editor, toolbarState.bullet, toolbarState.numbered],
  )

  const ToolbarButton = ({
    active,
    onClick,
    children,
    label,
  }: {
    active: boolean
    onClick: () => void
    children: ReactNode
    label: string
  }) => (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={onClick}
      className={cn("h-7 w-7", active && "bg-accent text-foreground")}
      title={label}
      type="button"
    >
      {children}
    </Button>
  )

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-1 py-1.5",
        className,
      )}
    >
      <ToolbarButton
        active={toolbarState.bold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        label="Bold"
      >
        <Bold className="size-3" />
      </ToolbarButton>
      <ToolbarButton
        active={toolbarState.italic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        label="Italic"
      >
        <Italic className="size-3" />
      </ToolbarButton>
      <ToolbarButton
        active={toolbarState.underline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        label="Underline"
      >
        <Underline className="size-3" />
      </ToolbarButton>
      <ToolbarButton
        active={toolbarState.highlight}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight")}
        label="Highlight"
      >
        <Highlighter className="size-3" />
      </ToolbarButton>
      <div className="mx-1 h-4 w-px bg-border/80" />
      <ToolbarButton
        active={toolbarState.bullet}
        onClick={() => toggleList("bullet")}
        label="Bullet list"
      >
        <List className="size-3" />
      </ToolbarButton>
      <ToolbarButton
        active={toolbarState.numbered}
        onClick={() => toggleList("number")}
        label="Numbered list"
      >
        <ListOrdered className="size-3" />
      </ToolbarButton>
    </div>
  )
}

interface NoteRichEditorProps {
  value: string
  onChange: (value: string, textContent: string) => void
  placeholder?: string
  className?: string
  editorClassName?: string
  toolbarClassName?: string
  autoFocus?: boolean
}

export function NoteRichEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  editorClassName,
  toolbarClassName,
  autoFocus = false,
}: NoteRichEditorProps) {
  const initialConfig = useMemo(
    () => ({
      namespace: "notes-editor",
      nodes: [ListNode, ListItemNode],
      theme: editorTheme,
      editorState: value || undefined,
      onError: (error: Error) => {
        console.error(error)
      },
    }),
    [value],
  )

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const textContent = $getRoot().getTextContent()
        onChange(JSON.stringify(editorState.toJSON()), textContent)
      })
    },
    [onChange],
  )

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <NoteEditorToolbar className={toolbarClassName} />
        <div className="relative flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  "min-h-[240px] rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-0",
                  editorClassName,
                )}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground/60">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleChange} />
          {autoFocus && <AutoFocusPlugin />}
        </div>
      </LexicalComposer>
    </div>
  )
}
