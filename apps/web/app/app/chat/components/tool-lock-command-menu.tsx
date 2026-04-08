"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { RefObject } from "react"
import { TerminalIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  PromptInputCommand,
  PromptInputCommandEmpty,
  PromptInputCommandGroup,
  PromptInputCommandItem,
  PromptInputCommandList,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input"
import {
  findToolLockCommandByToolKey,
  getToolLockCommandsForMode,
} from "@/lib/AITools/tool-lock-commands"
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

  const showCommandMenu = textInput.value.trimStart().startsWith("/")
  const queryText = textInput.value.trimStart().slice(1).toLowerCase()
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const filteredCommands = useMemo(() => {
    if (!showCommandMenu) return []
    if (!queryText) return modeCommands

    return modeCommands.filter((commandDef) => {
      const normalizedCommand = commandDef.command.slice(1).toLowerCase()
      return (
        normalizedCommand.includes(queryText) ||
        commandDef.label.toLowerCase().includes(queryText)
      )
    })
  }, [modeCommands, queryText, showCommandMenu])
  const activeCommand = filteredCommands[activeIndex] ?? filteredCommands[0]

  const lockedCommand = toolLock ? findToolLockCommandByToolKey(toolLock) : null

  const handleSelect = useCallback((command: (typeof modeCommands)[number]) => {
    if (command.toolKey === null) {
      setToolLock(null)
    } else {
      setToolLock(command.toolKey)
    }

    textInput.setInput(stripLeadingSlashCommand(textInput.value))
    textareaRef?.current?.focus()
  }, [setToolLock, textInput, textareaRef])

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
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {toolLock ? (
        <div className="flex items-center">
          <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-2 py-1 text-[11px] font-normal text-foreground">
            <span className="text-muted-foreground">Locked:</span>{" "}
            <span className="min-w-0 truncate font-medium tabular-nums">
              {lockedCommand?.command ?? toolLock}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-5 shrink-0 rounded-md p-0 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              onClick={clearToolLock}
              aria-label="Clear tool lock"
            >
              <XIcon className="size-3" />
            </Button>
          </div>
        </div>
      ) : null}

      {showCommandMenu ? (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-popover shadow-sm">
          <PromptInputCommand className="border-none bg-transparent">
            <PromptInputCommandList className="max-h-56">
              <PromptInputCommandEmpty className="text-xs text-muted-foreground">
                No matching command
              </PromptInputCommandEmpty>
              <PromptInputCommandGroup
                heading={`Commands for ${selectedMode}`}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {filteredCommands.map((commandDef) => {
                  const isActive = activeCommand?.command === commandDef.command
                  return (
                    <PromptInputCommandItem
                      key={commandDef.command}
                      ref={(node) => {
                        itemRefs.current[commandDef.command] = node
                      }}
                      value={`${commandDef.command} ${commandDef.label}`}
                      onSelect={() => handleSelect(commandDef)}
                      className={cn(
                        "items-start gap-2 py-2",
                        isActive
                          ? "bg-accent text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                          : undefined,
                      )}
                    >
                      <TerminalIcon
                        className={cn(
                          "mt-0.5 size-3 shrink-0 opacity-80",
                          isActive
                            ? "text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-xs font-medium leading-snug">
                          {commandDef.command}
                        </span>
                        <span
                          className={cn(
                            "text-[11px] leading-snug",
                            isActive
                              ? "text-accent-foreground/85"
                              : "text-muted-foreground",
                          )}
                        >
                          {commandDef.description}
                        </span>
                      </div>
                    </PromptInputCommandItem>
                  )
                })}
              </PromptInputCommandGroup>
            </PromptInputCommandList>
          </PromptInputCommand>
        </div>
      ) : null}
    </div>
  )
}
