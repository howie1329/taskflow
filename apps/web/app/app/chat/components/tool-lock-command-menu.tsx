"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { RefObject } from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { parseSlashCommandInput } from "@/lib/chat/slash-command-query"
import {
  findToolLockCommandByToolKey,
  getToolLockCommandsForMode,
} from "@/lib/AITools/tool-lock-commands"
import { usePromptInputController } from "@/components/ai-elements/prompt-input"
import { useChatConfig, useChatConfigActions } from "./chat-provider"

interface ToolLockCommandMenuProps {
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  className?: string
}

const stripLeadingSlashCommand = (value: string) => {
  return value.replace(/^\s*\/\S*\s*/, "")
}

export function ToolLockCommandMenu({
  textareaRef,
  className,
}: ToolLockCommandMenuProps) {
  const { textInput } = usePromptInputController()
  const { selectedMode, toolLock, thread } = useChatConfig()
  const { setToolLock } = useChatConfigActions()
  const hasDaytonaRepo = Boolean(thread?.daytona?.repoUrl)

  const modeCommands = useMemo(
    () =>
      getToolLockCommandsForMode(selectedMode, {
        includeDaytonaCommands: hasDaytonaRepo,
      }),
    [hasDaytonaRepo, selectedMode],
  )

  const { menuOpen: showCommandMenu, filterQuery: queryText } =
    parseSlashCommandInput(textInput.value)
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const filteredCommands = useMemo(() => {
    if (!showCommandMenu) return []
    if (!queryText) return modeCommands

    return modeCommands.filter((commandDef) => {
      const normalizedCommand = commandDef.command.slice(1).toLowerCase()
      return (
        normalizedCommand.includes(queryText) ||
        commandDef.label.toLowerCase().includes(queryText) ||
        commandDef.description.toLowerCase().includes(queryText)
      )
    })
  }, [modeCommands, queryText, showCommandMenu])
  const activeCommand = filteredCommands[activeIndex] ?? filteredCommands[0]

  const lockedCommand = toolLock ? findToolLockCommandByToolKey(toolLock) : null

  const handleSelect = useCallback(
    (command: (typeof modeCommands)[number]) => {
      if (command.toolKey === null) {
        setToolLock(null)
      } else {
        setToolLock(command.toolKey)
      }

      textInput.setInput(stripLeadingSlashCommand(textInput.value))
      textareaRef?.current?.focus()
    },
    [setToolLock, textInput, textareaRef],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0)
  }, [queryText, selectedMode, showCommandMenu])

  useEffect(() => {
    if (!showCommandMenu) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex((current) => {
      if (filteredCommands.length === 0) return 0
      return Math.min(current, filteredCommands.length - 1)
    })
  }, [filteredCommands, showCommandMenu])

  useEffect(() => {
    if (!showCommandMenu || !activeCommand) return
    const activeElement = itemRefs.current[activeCommand.command]
    activeElement?.scrollIntoView({ block: "nearest" })
  }, [activeCommand, showCommandMenu])

  useEffect(() => {
    const textarea = textareaRef?.current
    if (!textarea || !showCommandMenu) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showCommandMenu) return

      if (event.key === "Escape") {
        event.preventDefault()
        textInput.setInput(stripLeadingSlashCommand(textInput.value))
        textareaRef?.current?.focus()
        return
      }

      if (filteredCommands.length === 0) return

      if (event.key === "Tab") {
        event.preventDefault()
        setActiveIndex((current) =>
          event.shiftKey
            ? (current - 1 + filteredCommands.length) % filteredCommands.length
            : (current + 1) % filteredCommands.length,
        )
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % filteredCommands.length)
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((current) =>
          (current - 1 + filteredCommands.length) % filteredCommands.length,
        )
        return
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        handleSelect(activeCommand)
      }
    }

    textarea.addEventListener("keydown", handleKeyDown)
    return () => {
      textarea.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    activeCommand,
    filteredCommands.length,
    handleSelect,
    showCommandMenu,
    textInput,
    textareaRef,
  ])

  const clearToolLock = () => {
    setToolLock(null)
    textareaRef?.current?.focus()
  }

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {toolLock ? (
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Next message</span>
            {" · "}
            {lockedCommand?.label ?? toolLock}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0 rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            onClick={clearToolLock}
            aria-label="Clear next-message tool targeting"
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      ) : null}

      {showCommandMenu ? (
        <div
          className="overflow-hidden rounded-lg border border-border/70 bg-popover"
          role="listbox"
          aria-label="Commands for your next message"
        >
          <div className="border-b border-border/50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Next message tool
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedMode} mode · applies once, then clears after send
            </p>
          </div>
          <div className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filteredCommands.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">
                No matching command. Try another word or clear the slash.
              </p>
            ) : (
              filteredCommands.map((commandDef) => {
                const isActive = activeCommand?.command === commandDef.command
                return (
                  <div
                    key={commandDef.command}
                    ref={(node) => {
                      itemRefs.current[commandDef.command] = node
                    }}
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "mx-1 cursor-pointer rounded-md px-2 py-2 outline-none transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(commandDef)
                    }}
                    onMouseEnter={() => {
                      setActiveIndex(filteredCommands.indexOf(commandDef))
                    }}
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-xs font-medium leading-snug">
                        {commandDef.label}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] leading-snug",
                          isActive
                            ? "text-accent-foreground/90"
                            : "text-muted-foreground",
                        )}
                      >
                        {commandDef.description}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px] leading-none",
                          isActive
                            ? "text-accent-foreground/75"
                            : "text-muted-foreground/80",
                        )}
                      >
                        {commandDef.command}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
