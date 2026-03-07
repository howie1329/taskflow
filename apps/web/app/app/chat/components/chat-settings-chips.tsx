"use client"

import { useMemo, useState } from "react"
import type { Doc } from "@/convex/_generated/dataModel"
import { ModelSelectorLogo } from "@/components/ai-elements/model-selector"
import type { ModeName } from "@/lib/AITools/ModePrompts"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  FolderIcon,
  GlobeIcon,
  CpuIcon,
  WandSparklesIcon,
} from "lucide-react"
import {
  CHAT_SETTINGS_POPOVER_CLASS_NAME,
  CHAT_SETTINGS_TRIGGER_CLASS_NAME,
  ModelSettingsList,
  ModeSettingsList,
  ProjectSettingsList,
} from "./chat-settings-menu"

interface ChatSettingsChipsProps {
  availableModels: Doc<"availableModels">[]
  selectedModelId: string | null
  onSelectModelId: (modelId: string | null) => void
  selectedMode: ModeName
  onSelectMode: (mode: ModeName) => void
  projects: Doc<"projects">[]
  selectedProjectId: string | null
  onSelectProjectId: (projectId: string | null) => void
  showImageAction?: boolean
}

export function ChatSettingsChips({
  availableModels,
  selectedModelId,
  onSelectModelId,
  selectedMode,
  onSelectMode,
  projects,
  selectedProjectId,
  onSelectProjectId,
  showImageAction = false,
}: ChatSettingsChipsProps) {
  const [openPanel, setOpenPanel] = useState<"model" | "mode" | "project" | null>(null)
  const selectedModel =
    availableModels.find((model) => model.modelId === selectedModelId) ?? null
  const selectedProject =
    projects.find((project) => project._id === selectedProjectId) ?? null

  const projectLabel = useMemo(() => {
    if (!selectedProject) return "No project"
    return `${selectedProject.icon} ${selectedProject.title}`
  }, [selectedProject])

  return (
    <>
      <Tooltip>
        <Popover open={openPanel === "model"} onOpenChange={(open) => setOpenPanel(open ? "model" : null)}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`Model: ${selectedModel?.name ?? "Select model"}`}
                className={cn(
                  CHAT_SETTINGS_TRIGGER_CLASS_NAME,
                  "h-7 max-w-44 justify-start gap-2 px-2.5 sm:max-w-52",
                )}
              >
                {selectedModel?.provider ? (
                  <ModelSelectorLogo provider={selectedModel.provider} className="size-3.5 shrink-0" />
                ) : (
                  <CpuIcon className="size-3.5 shrink-0" />
                )}
                <span className="truncate text-xs font-medium">
                  {selectedModel?.name ?? "Select model"}
                </span>
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent sideOffset={6}>
            <p>{selectedModel?.name ?? "Select model"}</p>
          </TooltipContent>
          <PopoverContent
            align="start"
            sideOffset={10}
            className={cn("w-[min(92vw,28rem)]", CHAT_SETTINGS_POPOVER_CLASS_NAME)}
          >
            <ModelSettingsList
              availableModels={availableModels}
              selectedModelId={selectedModelId}
              onSelectModelId={onSelectModelId}
              onClose={() => setOpenPanel(null)}
            />
          </PopoverContent>
        </Popover>
      </Tooltip>

      <Tooltip>
        <Popover open={openPanel === "mode"} onOpenChange={(open) => setOpenPanel(open ? "mode" : null)}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Mode: ${selectedMode}`}
                className={cn(CHAT_SETTINGS_TRIGGER_CLASS_NAME, "size-7")}
              >
                <WandSparklesIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent sideOffset={6}>
            <p>{`Mode: ${selectedMode}`}</p>
          </TooltipContent>
          <PopoverContent
            align="start"
            sideOffset={10}
            className={cn("w-[min(92vw,28rem)]", CHAT_SETTINGS_POPOVER_CLASS_NAME)}
          >
            <ModeSettingsList
              selectedMode={selectedMode}
              onSelectMode={onSelectMode}
              onClose={() => setOpenPanel(null)}
            />
          </PopoverContent>
        </Popover>
      </Tooltip>

      <Tooltip>
        <Popover open={openPanel === "project"} onOpenChange={(open) => setOpenPanel(open ? "project" : null)}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Project: ${projectLabel}`}
                className={cn(CHAT_SETTINGS_TRIGGER_CLASS_NAME, "size-7")}
              >
                {selectedProject ? (
                  <FolderIcon className="size-3.5" />
                ) : (
                  <GlobeIcon className="size-3.5" />
                )}
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent sideOffset={6}>
            <p>{projectLabel}</p>
          </TooltipContent>
          <PopoverContent
            align="start"
            sideOffset={10}
            className={cn("w-[min(92vw,28rem)]", CHAT_SETTINGS_POPOVER_CLASS_NAME)}
          >
            <ProjectSettingsList
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProjectId={onSelectProjectId}
              showImageAction={showImageAction}
              onClose={() => setOpenPanel(null)}
            />
          </PopoverContent>
        </Popover>
      </Tooltip>
    </>
  )
}
