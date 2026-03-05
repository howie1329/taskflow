"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { createPortal } from "react-dom"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
  type MenuRenderFn,
} from "@lexical/react/LexicalTypeaheadMenuPlugin"
import {
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type EditorState,
  type LexicalEditor,
} from "lexical"
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import {
  $convertToMarkdownString,
  CODE,
  HEADING,
  INLINE_CODE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  UNORDERED_LIST,
  type Transformer,
} from "@lexical/markdown"
import { $setBlocksType } from "@lexical/selection"
import { $findMatchingParent } from "@lexical/utils"
import {
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link"
import {
  $createHeadingNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text"
import {
  $createCodeNode,
  $isCodeNode,
  CodeHighlightNode,
  CodeNode,
  registerCodeHighlighting,
} from "@lexical/code"
import {
  Bold,
  Code2,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Underline,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const MARKDOWN_TRANSFORMERS: Transformer[] = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CODE,
  INLINE_CODE,
  LINK,
]

const URL_MATCHER = createLinkMatcherWithRegExp(
  /((https?:\/\/)|(www\.))[^\s]+/,
  (text) => {
    if (text.startsWith("http://") || text.startsWith("https://")) {
      return text
    }
    return `https://${text}`
  },
)

const EMAIL_MATCHER = createLinkMatcherWithRegExp(
  /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/,
  (text) => `mailto:${text}`,
)

const editorTheme = {
  paragraph: "text-sm leading-relaxed",
  quote:
    "border-l-2 border-border/80 pl-3 italic text-muted-foreground my-1 text-sm",
  heading: {
    h1: "text-2xl font-semibold tracking-tight",
    h2: "text-xl font-semibold tracking-tight",
    h3: "text-lg font-semibold tracking-tight",
  },
  link: "text-primary underline underline-offset-2",
  code: "rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-[13px]",
  codeHighlight: {
    atrule: "text-violet-500",
    attr: "text-cyan-500",
    boolean: "text-amber-500",
    builtin: "text-teal-500",
    cdata: "text-muted-foreground",
    char: "text-lime-500",
    class: "text-emerald-500",
    comment: "text-muted-foreground",
    constant: "text-fuchsia-500",
    deleted: "text-red-500",
    doctype: "text-muted-foreground",
    entity: "text-sky-500",
    function: "text-blue-500",
    important: "text-orange-500",
    inserted: "text-green-500",
    keyword: "text-violet-500",
    namespace: "text-amber-500",
    number: "text-orange-500",
    operator: "text-muted-foreground",
    prolog: "text-muted-foreground",
    property: "text-cyan-500",
    punctuation: "text-muted-foreground",
    regex: "text-pink-500",
    selector: "text-fuchsia-500",
    string: "text-lime-500",
    symbol: "text-sky-500",
    tag: "text-violet-500",
    url: "text-blue-500",
    variable: "text-amber-500",
  },
  list: {
    listitem: "ml-5 list-item",
    ul: "list-disc pl-5",
    ol: "list-decimal pl-5",
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    code: "rounded-sm bg-muted px-1 font-mono text-[13px]",
    highlight: "bg-yellow-200/70 dark:bg-yellow-500/30 rounded-[2px]",
  },
}

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "code"

type ToolbarState = {
  bold: boolean
  italic: boolean
  underline: boolean
  code: boolean
  highlight: boolean
  bullet: boolean
  numbered: boolean
  link: boolean
  blockType: BlockType
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

function getActiveBlockType(): BlockType {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return "paragraph"

  const anchorNode = selection.anchor.getNode()
  const topLevel =
    anchorNode.getKey() === "root"
      ? anchorNode
      : $findMatchingParent(anchorNode, (node) => {
          const parent = node.getParent()
          return parent !== null && $isRootOrShadowRoot(parent)
        })

  if ($isHeadingNode(topLevel)) {
    return topLevel.getTag() as BlockType
  }
  if ($isQuoteNode(topLevel)) {
    return "quote"
  }
  if ($isCodeNode(topLevel)) {
    return "code"
  }
  return "paragraph"
}

function hasActiveLink() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return false

  const node = selection.anchor.getNode()
  return $isLinkNode(node) || !!$findMatchingParent(node, $isLinkNode)
}

function normalizeUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return ""

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#")
  ) {
    return trimmed
  }

  if (trimmed.includes("@")) {
    return `mailto:${trimmed}`
  }

  return `https://${trimmed}`
}

function setBlockType(editor: LexicalEditor, blockType: BlockType) {
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    if (blockType === "paragraph") {
      $setBlocksType(selection, () => $createParagraphNode())
      return
    }

    if (blockType === "quote") {
      $setBlocksType(selection, () => $createQuoteNode())
      return
    }

    if (blockType === "code") {
      $setBlocksType(selection, () => $createCodeNode())
      return
    }

    $setBlocksType(selection, () => $createHeadingNode(blockType as HeadingTagType))
  })
}

function toggleList(editor: LexicalEditor, type: "bullet" | "number", active: boolean) {
  if (type === "bullet") {
    editor.dispatchCommand(
      active ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
      undefined,
    )
    return
  }

  editor.dispatchCommand(
    active ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
    undefined,
  )
}

function Shortcut({ value }: { value?: string }) {
  if (!value) return null

  return (
    <KbdGroup className="ml-2">
      {value.split("+").map((part) => (
        <Kbd key={part}>{part}</Kbd>
      ))}
    </KbdGroup>
  )
}

function ToolbarButton({
  active,
  onClick,
  icon,
  label,
  shortcut,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  shortcut?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClick}
          className={cn("h-7 w-7", active && "bg-accent text-foreground")}
          type="button"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="flex items-center">
        <span>{label}</span>
        <Shortcut value={shortcut} />
      </TooltipContent>
    </Tooltip>
  )
}

type LinkEditorProps = {
  onApply: (url: string) => void
  onRemove: () => void
  initialUrl: string
}

function LinkEditor({ onApply, onRemove, initialUrl }: LinkEditorProps) {
  const [value, setValue] = useState(initialUrl)

  useEffect(() => {
    setValue(initialUrl)
  }, [initialUrl])

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onApply(value)
          }
        }}
        placeholder="Paste or type URL"
        className="h-8 text-xs"
      />
      <div className="flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={onRemove}
          type="button"
        >
          Remove link
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={() => onApply(value)}
          type="button"
        >
          Apply
        </Button>
      </div>
    </div>
  )
}

class SlashCommandOption extends MenuOption {
  title: string
  keywords: string[]
  icon: ReactNode
  execute: (editor: LexicalEditor) => void

  constructor({
    title,
    keywords,
    icon,
    execute,
  }: {
    title: string
    keywords: string[]
    icon: ReactNode
    execute: (editor: LexicalEditor) => void
  }) {
    super(title)
    this.title = title
    this.keywords = keywords
    this.icon = icon
    this.execute = execute
  }
}

function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
    maxLength: 30,
  })

  const triggerFn = useCallback(
    (text: string, editor: LexicalEditor) => {
      const match = checkForSlashTriggerMatch(text, editor)
      if (!match) return null

      let inCodeBlock = false
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const topLevel = selection.anchor.getNode().getTopLevelElementOrThrow()
        inCodeBlock = $isCodeNode(topLevel)
      })

      if (inCodeBlock) return null
      return match
    },
    [checkForSlashTriggerMatch],
  )

  const options = useMemo(
    () => [
      new SlashCommandOption({
        title: "Paragraph",
        keywords: ["p", "text", "normal"],
        icon: <Pilcrow className="size-3.5" />,
        execute: (editor) => setBlockType(editor, "paragraph"),
      }),
      new SlashCommandOption({
        title: "Heading 1",
        keywords: ["h1", "title"],
        icon: <Heading1 className="size-3.5" />,
        execute: (editor) => setBlockType(editor, "h1"),
      }),
      new SlashCommandOption({
        title: "Heading 2",
        keywords: ["h2", "section"],
        icon: <Heading2 className="size-3.5" />,
        execute: (editor) => setBlockType(editor, "h2"),
      }),
      new SlashCommandOption({
        title: "Heading 3",
        keywords: ["h3", "subsection"],
        icon: <Heading3 className="size-3.5" />,
        execute: (editor) => setBlockType(editor, "h3"),
      }),
      new SlashCommandOption({
        title: "Bullet List",
        keywords: ["ul", "list", "bullet"],
        icon: <List className="size-3.5" />,
        execute: (editor) => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        },
      }),
      new SlashCommandOption({
        title: "Numbered List",
        keywords: ["ol", "list", "number"],
        icon: <ListOrdered className="size-3.5" />,
        execute: (editor) => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        },
      }),
      new SlashCommandOption({
        title: "Blockquote",
        keywords: ["quote", "blockquote"],
        icon: <Quote className="size-3.5" />,
        execute: (editor) => setBlockType(editor, "quote"),
      }),
      new SlashCommandOption({
        title: "Code Block",
        keywords: ["code", "pre"],
        icon: <Code2 className="size-3.5" />,
        execute: (editor) => setBlockType(editor, "code"),
      }),
      new SlashCommandOption({
        title: "Link",
        keywords: ["link", "url"],
        icon: <Link2 className="size-3.5" />,
        execute: (editor) => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://")
        },
      }),
    ],
    [],
  )

  const filteredOptions = useMemo(() => {
    if (!queryString) return options

    const query = queryString.toLowerCase()
    return options.filter((option) => {
      if (option.title.toLowerCase().includes(query)) return true
      return option.keywords.some((keyword) => keyword.includes(query))
    })
  }, [options, queryString])

  const onSelectOption = useCallback(
    (
      selectedOption: SlashCommandOption,
      _nodeToRemove: unknown,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          selection.deleteCharacter(true)
        }
      })

      selectedOption.execute(editor)
      closeMenu()
    },
    [editor],
  )

  const menuRenderFn: MenuRenderFn<SlashCommandOption> = (
    anchorElementRef: RefObject<HTMLElement | null>,
    { selectedIndex, options, setHighlightedIndex, selectOptionAndCleanUp },
  ) => {
    if (!anchorElementRef.current || options.length === 0) {
      return null
    }

    return createPortal(
      <div className="z-50 max-h-72 w-56 overflow-y-auto rounded-md border border-border/60 bg-popover p-1 shadow-md">
        {options.map((option, index) => (
          <button
            key={option.key}
            ref={option.setRefElement}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs",
              index === selectedIndex
                ? "bg-accent text-foreground"
                : "text-muted-foreground",
            )}
            onMouseEnter={() => setHighlightedIndex(index)}
            onMouseDown={(event) => {
              event.preventDefault()
              selectOptionAndCleanUp(option)
            }}
          >
            {option.icon}
            <span>{option.title}</span>
          </button>
        ))}
      </div>,
      anchorElementRef.current,
    )
  }

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      triggerFn={triggerFn}
      options={filteredOptions}
      onSelectOption={onSelectOption}
      menuRenderFn={menuRenderFn}
      commandPriority={COMMAND_PRIORITY_EDITOR}
    />
  )
}

function CodeSyntaxHighlightPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return registerCodeHighlighting(editor)
  }, [editor])

  return null
}

function KeyboardShortcutsPlugin({
  onOpenLinkEditor,
}: {
  onOpenLinkEditor: () => void
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        const isMod = event.metaKey || event.ctrlKey
        if (!isMod) return false

        const key = event.key.toLowerCase()

        if (key === "b") {
          event.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
          return true
        }

        if (key === "i") {
          event.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
          return true
        }

        if (key === "u") {
          event.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          return true
        }

        if (key === "h" && event.shiftKey) {
          event.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight")
          return true
        }

        if (key === "k") {
          event.preventDefault()
          onOpenLinkEditor()
          return true
        }

        return false
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor, onOpenLinkEditor])

  return null
}

function NoteEditorToolbar({ className }: { className?: string }) {
  const [editor] = useLexicalComposerContext()
  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPhone|iPad/.test(window.navigator.platform)
  const [linkOpen, setLinkOpen] = useState(false)
  const [activeLinkUrl, setActiveLinkUrl] = useState("")
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    code: false,
    highlight: false,
    bullet: false,
    numbered: false,
    link: false,
    blockType: "paragraph",
  })

  const mod = isMac ? "⌘" : "Ctrl"

  const readCurrentLink = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        setActiveLinkUrl("")
        return
      }

      const node = selection.anchor.getNode()
      const linkNode = $isLinkNode(node)
        ? node
        : $findMatchingParent(node, $isLinkNode)

      setActiveLinkUrl(linkNode ? linkNode.getURL() : "")
    })
  }, [editor])

  const openLinkEditor = useCallback(() => {
    readCurrentLink()
    setLinkOpen(true)
  }, [readCurrentLink])

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const listType = getActiveListType()

    setToolbarState({
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      code: selection.hasFormat("code"),
      highlight: selection.hasFormat("highlight"),
      bullet: listType === "bullet",
      numbered: listType === "number",
      link: hasActiveLink(),
      blockType: getActiveBlockType(),
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

  const copyAsMarkdown = useCallback(() => {
    let markdown = ""

    editor.getEditorState().read(() => {
      markdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS)
    })

    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        toast.success("Copied as Markdown")
      })
      .catch(() => {
        toast.error("Failed to copy markdown")
      })
  }, [editor])

  const applyLink = useCallback(
    (url: string) => {
      const normalized = normalizeUrl(url)

      editor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        normalized || "https://",
      )
      setLinkOpen(false)
    },
    [editor],
  )

  const removeLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    setLinkOpen(false)
  }, [editor])

  return (
    <>
      <KeyboardShortcutsPlugin onOpenLinkEditor={openLinkEditor} />
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
          shortcut={`${mod}+B`}
          icon={<Bold className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.italic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          label="Italic"
          shortcut={`${mod}+I`}
          icon={<Italic className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.underline}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          label="Underline"
          shortcut={`${mod}+U`}
          icon={<Underline className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.highlight}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight")}
          label="Highlight"
          shortcut={`${mod}+Shift+H`}
          icon={<Highlighter className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.code}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          label="Inline code"
          icon={<Code2 className="size-3" />}
        />

        <div className="mx-1 h-4 w-px bg-border/80" />

        <ToolbarButton
          active={toolbarState.blockType === "paragraph"}
          onClick={() => setBlockType(editor, "paragraph")}
          label="Paragraph"
          icon={<Pilcrow className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.blockType === "h1"}
          onClick={() => setBlockType(editor, "h1")}
          label="Heading 1"
          icon={<Heading1 className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.blockType === "h2"}
          onClick={() => setBlockType(editor, "h2")}
          label="Heading 2"
          icon={<Heading2 className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.blockType === "h3"}
          onClick={() => setBlockType(editor, "h3")}
          label="Heading 3"
          icon={<Heading3 className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.blockType === "quote"}
          onClick={() => setBlockType(editor, "quote")}
          label="Blockquote"
          icon={<Quote className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.blockType === "code"}
          onClick={() => setBlockType(editor, "code")}
          label="Code block"
          icon={<Code2 className="size-3" />}
        />

        <div className="mx-1 h-4 w-px bg-border/80" />

        <ToolbarButton
          active={toolbarState.bullet}
          onClick={() => toggleList(editor, "bullet", toolbarState.bullet)}
          label="Bullet list"
          icon={<List className="size-3" />}
        />
        <ToolbarButton
          active={toolbarState.numbered}
          onClick={() => toggleList(editor, "number", toolbarState.numbered)}
          label="Numbered list"
          icon={<ListOrdered className="size-3" />}
        />

        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <div>
              <ToolbarButton
                active={toolbarState.link}
                onClick={openLinkEditor}
                label="Link"
                shortcut={`${mod}+K`}
                icon={<Link2 className="size-3" />}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <LinkEditor
              initialUrl={activeLinkUrl}
              onApply={applyLink}
              onRemove={removeLink}
            />
          </PopoverContent>
        </Popover>

        <ToolbarButton
          active={false}
          onClick={copyAsMarkdown}
          label="Copy as Markdown"
          icon={<Copy className="size-3" />}
        />
      </div>
    </>
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
      nodes: [
        ListNode,
        ListItemNode,
        HeadingNode,
        QuoteNode,
        LinkNode,
        AutoLinkNode,
        CodeNode,
        CodeHighlightNode,
      ],
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
          <LinkPlugin
            validateUrl={(url) => url.startsWith("/") || !!normalizeUrl(url)}
          />
          <AutoLinkPlugin matchers={[URL_MATCHER, EMAIL_MATCHER]} />
          <CodeSyntaxHighlightPlugin />
          <TabIndentationPlugin />
          <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
          <OnChangePlugin onChange={handleChange} />
          <SlashCommandPlugin />
          {autoFocus && <AutoFocusPlugin />}
        </div>
      </LexicalComposer>
    </div>
  )
}
