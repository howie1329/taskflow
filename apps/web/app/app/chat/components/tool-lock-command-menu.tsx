"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { RefObject } from "react"
import { XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { useChatContext } from "./chat-provider"

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
  const { selectedMode, toolLock, setToolLock } = useChatContext()

  const modeCommands = useMemo(
    () => getToolLockCommandsForMode(selectedMode),
    [selectedMode],
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
    setActiveIndex(0)
  }, [queryText, selectedMode, showCommandMenu])

  useEffect(() => {
    if (!showCommandMenu) return

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
      if (!showCommandMenu || filteredCommands.length === 0) return

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
          <Badge
            variant="secondary"
            className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/25 px-2.5 py-0.5 text-[11px] font-normal"
          >
            <span className="text-muted-foreground">Locked:</span>{" "}
            {lockedCommand?.command ?? toolLock}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-4 rounded-full p-0 hover:bg-transparent"
              onClick={clearToolLock}
              aria-label="Clear tool lock"
            >
              <XIcon className="size-3" />
            </Button>
          </Badge>
        </div>
      ) : null}

      {showCommandMenu ? (
        <div className="overflow-hidden rounded-md border border-border/60 bg-background">
          <PromptInputCommand className="border-none">
            <PromptInputCommandList className="max-h-56">
              <PromptInputCommandEmpty>No matching command</PromptInputCommandEmpty>
              <PromptInputCommandGroup heading={`Commands for ${selectedMode}`}>
                {filteredCommands.map((commandDef) => (
                  <PromptInputCommandItem
                    key={commandDef.command}
                    ref={(node) => {
                      itemRefs.current[commandDef.command] = node
                    }}
                    value={`${commandDef.command} ${commandDef.label}`}
                    onSelect={() => handleSelect(commandDef)}
                    className={
                      activeCommand?.command === commandDef.command
                        ? "bg-accent text-accent-foreground"
                        : undefined
                    }
                  >
                    <div className="flex w-full flex-col">
                      <span className="font-medium text-xs">{commandDef.command}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {commandDef.description}
                      </span>
                    </div>
                  </PromptInputCommandItem>
                ))}
              </PromptInputCommandGroup>
            </PromptInputCommandList>
          </PromptInputCommand>
        </div>
      ) : null}
    </div>
  )
}
