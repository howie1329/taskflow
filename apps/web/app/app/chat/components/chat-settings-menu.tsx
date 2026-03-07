"use client"

import { useMemo, useState, type ReactNode } from "react"
import type { Doc } from "@/convex/_generated/dataModel"
import { ModelSelectorLogo } from "@/components/ai-elements/model-selector"
import type { ModeName } from "@/lib/AITools/ModePrompts"
import { AVAILABLE_MODES, getModeDescription } from "@/lib/AITools/ModePrompts"
import { formatModelPrice } from "./format-model-price"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input"
import { cn } from "@/lib/utils"
import {
  CircleHelpIcon,
  CheckIcon,
  CpuIcon,
  FolderCogIcon,
  FolderIcon,
  GlobeIcon,
  ImageIcon,
  SearchIcon,
  SparklesIcon,
  SlidersHorizontalIcon,
  WandSparklesIcon,
} from "lucide-react"

export interface ChatSettingsContentProps {
  availableModels: Doc<"availableModels">[]
  selectedModelId: string | null
  onSelectModelId: (modelId: string | null) => void
  selectedMode: ModeName
  onSelectMode: (mode: ModeName) => void
  projects: Doc<"projects">[]
  selectedProjectId: string | null
  onSelectProjectId: (projectId: string | null) => void
  showImageAction?: boolean
  onClose?: () => void
}

interface ChatSettingsMenuProps extends ChatSettingsContentProps {
  triggerIcon?: ReactNode
  triggerLabel?: string
  triggerAriaLabel?: string
  triggerClassName?: string
  showSelectedModelInTrigger?: boolean
}

export const CHAT_SETTINGS_TRIGGER_CLASS_NAME =
  "rounded-full border border-border/60 bg-background/70 text-foreground shadow-sm hover:bg-muted/70"

export const CHAT_SETTINGS_POPOVER_CLASS_NAME =
  "overflow-hidden rounded-[28px] bg-background/96 p-0 ring-1 ring-border/35 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl"

export function ChatSettingsMenu({
  availableModels,
  selectedModelId,
  onSelectModelId,
  selectedMode,
  onSelectMode,
  projects,
  selectedProjectId,
  onSelectProjectId,
  triggerIcon,
  triggerLabel = "Settings",
  triggerAriaLabel = "Chat settings",
  triggerClassName = CHAT_SETTINGS_TRIGGER_CLASS_NAME,
  showImageAction = false,
  showSelectedModelInTrigger = false,
}: ChatSettingsMenuProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"models" | "modes" | "projects">("models")
  const selectedModel =
    availableModels.find((model) => model.modelId === selectedModelId) ?? null
  const selectedProject =
    projects.find((project) => project._id === selectedProjectId) ?? null
  const triggerText = useMemo(() => {
    if (showSelectedModelInTrigger) {
      return selectedModel?.name ?? "Select model"
    }

    return triggerLabel
  }, [selectedModel?.name, showSelectedModelInTrigger, triggerLabel])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size={showSelectedModelInTrigger ? "sm" : "icon-sm"}
              aria-label={triggerAriaLabel}
              className={cn(
                CHAT_SETTINGS_TRIGGER_CLASS_NAME,
                showSelectedModelInTrigger
                  ? "h-7 max-w-52 justify-start gap-2 px-2.5"
                  : "size-7",
                triggerClassName,
              )}
            >
              {showSelectedModelInTrigger && selectedModel?.provider ? (
                <ModelSelectorLogo provider={selectedModel.provider} className="size-3.5 shrink-0" />
              ) : (
                triggerIcon ?? <SlidersHorizontalIcon className="size-3.5 shrink-0" />
              )}
              {showSelectedModelInTrigger ? (
                <span className="truncate text-xs font-medium">{triggerText}</span>
              ) : null}
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent sideOffset={6}>
          <p>{showSelectedModelInTrigger ? triggerText : triggerLabel}</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={10}
        className={cn("w-[min(92vw,34rem)]", CHAT_SETTINGS_POPOVER_CLASS_NAME)}
      >
        <div className="border-b border-border/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-2xl bg-muted/45 text-foreground">
              <SlidersHorizontalIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-foreground">Chat Settings</h3>
              <p className="text-xs text-muted-foreground">
                Tune the model, mode, and scope.
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-1.5 text-[11px] text-muted-foreground sm:grid-cols-3">
            <SettingsSummaryPill
              icon={
                selectedModel?.provider ? (
                  <ModelSelectorLogo provider={selectedModel.provider} className="size-3" />
                ) : (
                  <SparklesIcon className="size-3" />
                )
              }
              label={selectedModel?.name ?? "Select model"}
            />
            <SettingsSummaryPill
              icon={<WandSparklesIcon className="size-3" />}
              label={selectedMode}
            />
            <SettingsSummaryPill
              icon={selectedProject ? <FolderIcon className="size-3" /> : <GlobeIcon className="size-3" />}
              label={selectedProject ? `${selectedProject.icon} ${selectedProject.title}` : "No project"}
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "models" | "modes" | "projects")
          }
          className="gap-0"
        >
          <div className="border-b border-border/20 px-3 py-2">
            <TabsList
              variant="line"
              className="grid h-auto w-full grid-cols-3 rounded-2xl bg-muted/30 p-1"
            >
              <TabsTrigger
                value="models"
                className="rounded-xl px-2 py-2 text-xs data-active:bg-background/80"
              >
                <SparklesIcon className="size-3.5" />
                Models
              </TabsTrigger>
              <TabsTrigger
                value="modes"
                className="rounded-xl px-2 py-2 text-xs data-active:bg-background/80"
              >
                <WandSparklesIcon className="size-3.5" />
                Modes
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="rounded-xl px-2 py-2 text-xs data-active:bg-background/80"
              >
                <FolderCogIcon className="size-3.5" />
                Projects
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="models" className="mt-0">
            <ModelSettingsList
              availableModels={availableModels}
              selectedModelId={selectedModelId}
              onSelectModelId={onSelectModelId}
              onClose={() => setOpen(false)}
            />
          </TabsContent>

          <TabsContent value="modes" className="mt-0">
            <ModeSettingsList
              selectedMode={selectedMode}
              onSelectMode={onSelectMode}
              onClose={() => setOpen(false)}
            />
          </TabsContent>

          <TabsContent value="projects" className="mt-0">
            <ProjectSettingsList
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProjectId={onSelectProjectId}
              showImageAction={showImageAction}
              onClose={() => setOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

function SettingsSummaryPill({
  icon,
  label,
}: {
  icon: ReactNode
  label: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-full bg-muted/30 px-2.5 py-1.5">
      <span className="shrink-0 text-foreground/80">{icon}</span>
      <span className="truncate text-foreground/75">{label}</span>
    </div>
  )
}

export function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-border/20 px-1 py-1.5 last:border-b-0" aria-label={title}>
      <div className="px-1.5 pb-1 pt-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase text-muted-foreground">
          <span className="text-foreground/70">{icon}</span>
          <span>{title}</span>
        </div>
      </div>
      <div className="grid gap-1">{children}</div>
    </section>
  )
}

export function SettingsEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/20 px-3 py-4 text-center text-[11px] text-muted-foreground">
      {children}
    </div>
  )
}

export function SettingsOptionButton({
  selected = false,
  leadingIcon,
  title,
  description,
  meta,
  detail,
  tags,
  onClick,
}: {
  selected?: boolean
  leadingIcon?: ReactNode
  title: string
  description?: string
  meta?: string
  detail?: string
  tags?: string[]
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 items-start gap-3 rounded-2xl px-3 py-3 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        selected
          ? "bg-muted/55"
          : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-foreground/70",
          selected ? "bg-foreground/8 text-foreground" : "bg-muted/35",
        )}
      >
        {selected ? <CheckIcon className="size-3.5" /> : leadingIcon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{title}</span>
            {meta ? (
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                {meta}
              </span>
            ) : null}
          </span>
          {detail ? (
            <span className="max-w-full shrink-0 rounded-full bg-muted/45 px-2 py-1 text-[10px] font-medium text-foreground/70 sm:max-w-50">
              {detail}
            </span>
          ) : null}
        </span>
        {description ? (
          <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        ) : null}
        {tags?.length ? (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted/40 px-2 py-1 text-[10px] font-medium text-foreground/65"
              >
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  )
}

export function ModelSettingsList({
  availableModels,
  selectedModelId,
  onSelectModelId,
  onClose,
}: Pick<
  ChatSettingsContentProps,
  "availableModels" | "selectedModelId" | "onSelectModelId" | "onClose"
>) {
  const [searchQuery, setSearchQuery] = useState("")
  const filteredModels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return availableModels

    return availableModels.filter((model) =>
      `${model.name} ${model.provider ?? ""}`.toLowerCase().includes(query)
    )
  }, [availableModels, searchQuery])

  return (
    <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-1 py-1">
      <div className="px-1 pb-1 pt-0.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search models..."
            className="h-7 rounded-md border-border/40 bg-muted/20 pl-7"
          />
        </div>
      </div>
      <SettingsSection
        icon={<SparklesIcon className="size-3.5" />}
        title="Model"
      >
        {availableModels.length === 0 ? (
          <SettingsEmptyState>
            No models available right now.
          </SettingsEmptyState>
        ) : filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <ModelSettingsOptionButton
              key={model.modelId}
              model={model}
              selected={model.modelId === selectedModelId}
              onClick={() => {
                onSelectModelId(model.modelId)
                onClose?.()
              }}
            />
          ))
        ) : (
          <SettingsEmptyState>
            No models found
          </SettingsEmptyState>
        )}
      </SettingsSection>
    </div>
  )
}

export function ModeSettingsList({
  selectedMode,
  onSelectMode,
  onClose,
}: Pick<ChatSettingsContentProps, "selectedMode" | "onSelectMode" | "onClose">) {
  const [searchQuery, setSearchQuery] = useState("")
  const filteredModes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return AVAILABLE_MODES

    return AVAILABLE_MODES.filter((mode) => mode.toLowerCase().includes(query))
  }, [searchQuery])

  return (
    <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-1 py-1">
      <div className="px-1 pb-1 pt-0.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search modes..."
            className="h-7 rounded-md border-border/40 bg-muted/20 pl-7"
          />
        </div>
      </div>
      <SettingsSection
        icon={<WandSparklesIcon className="size-3.5" />}
        title="Mode"
      >
        {filteredModes.length > 0 ? (
          filteredModes.map((mode) => (
            <ModeSettingsOptionButton
              key={mode}
              mode={mode}
              selected={mode === selectedMode}
              onClick={() => {
                onSelectMode(mode)
                onClose?.()
              }}
            />
          ))
        ) : (
          <SettingsEmptyState>No modes found</SettingsEmptyState>
        )}
      </SettingsSection>
    </div>
  )
}

export function ProjectSettingsList({
  projects,
  selectedProjectId,
  onSelectProjectId,
  showImageAction = false,
  onClose,
}: Pick<
  ChatSettingsContentProps,
  "projects" | "selectedProjectId" | "onSelectProjectId" | "showImageAction" | "onClose"
>) {
  const attachments = usePromptInputAttachments()
  const selectedProject =
    projects.find((project) => project._id === selectedProjectId) ?? null
  const [searchQuery, setSearchQuery] = useState("")
  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return projects

    return projects.filter((project) => project.title.toLowerCase().includes(query))
  }, [projects, searchQuery])

  return (
    <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-1 py-1">
      <div className="px-1 pb-1 pt-0.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects..."
            className="h-7 rounded-md border-border/40 bg-muted/20 pl-7"
          />
        </div>
      </div>
      <SettingsSection
        icon={
          selectedProject ? (
            <FolderIcon className="size-3.5" />
          ) : (
            <GlobeIcon className="size-3.5" />
          )
        }
        title="Project"
      >
        <ProjectSettingsOptionButton
          selected={selectedProjectId === null}
          icon={<GlobeIcon className="size-2.5" />}
          title="No project"
          meta="Full workspace"
          tooltipContent="Use the full workspace as context."
          onClick={() => {
            onSelectProjectId(null)
            onClose?.()
          }}
        />
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectSettingsOptionButton
              key={project._id}
              selected={project._id === selectedProjectId}
              icon={<FolderIcon className="size-2.5" />}
              title={`${project.icon} ${project.title}`}
              meta="Project scope"
              tooltipContent="Scope the chat to this project."
              onClick={() => {
                onSelectProjectId(project._id)
                onClose?.()
              }}
            />
          ))
        ) : (
          <SettingsEmptyState>No projects found</SettingsEmptyState>
        )}
        {showImageAction ? (
          <div className="mt-1.5 border-t border-border/15 px-1.5 pt-2">
            <ProjectSettingsOptionButton
              icon={<ImageIcon className="size-2.5" />}
              title="Add image"
              meta="Upload"
              onClick={() => {
                attachments.openFileDialog()
                onClose?.()
              }}
            />
          </div>
        ) : null}
      </SettingsSection>
    </div>
  )
}

export function buildModelMeta(model: Doc<"availableModels">): string | undefined {
  const parts = [
    model.provider,
    model.contextLength ? `${formatTokenCount(model.contextLength)} context` : null,
    model.modality,
  ].filter(Boolean)

  return parts.length ? parts.join(" • ") : undefined
}

function formatTokenCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "-"
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return `${trimTrailingZeros(millions)}M`
  }
  if (value >= 1_000) {
    const thousands = value / 1_000
    return `${trimTrailingZeros(thousands)}k`
  }
  return String(value)
}

function trimTrailingZeros(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "")
}

export function getCapabilityLabels(supportedParameters?: string[]): string[] {
  if (!supportedParameters?.length) return []

  const params = new Set(supportedParameters)
  const labels: string[] = []

  if (params.has("tools") || params.has("tool_choice")) labels.push("Tools")
  if (params.has("structured_outputs") || params.has("response_format")) {
    labels.push("Structured")
  }
  if (params.has("reasoning") || params.has("include_reasoning")) {
    labels.push("Reasoning")
  }
  if (params.has("seed")) labels.push("Seed")
  if (params.has("temperature") || params.has("top_p")) labels.push("Sampling")
  if (params.has("stop")) labels.push("Stops")

  return labels
}

function ModelSettingsOptionButton({
  model,
  selected,
  onClick,
}: {
  model: Doc<"availableModels">
  selected: boolean
  onClick: () => void
}) {
  const compactInputOutput = formatCompactInputOutput(model)
  const capabilityLabels = getCapabilityLabels(model.supportedParameters)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        selected ? "bg-muted/55" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full bg-muted/35 text-foreground/75",
          selected ? "bg-foreground/8 text-foreground" : null,
        )}
      >
        {model.provider ? (
          <ModelSelectorLogo provider={model.provider} className="size-2.5" />
        ) : selected ? (
          <CheckIcon className="size-2.5" />
        ) : (
          <CpuIcon className="size-2.5" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-medium text-foreground">{model.name}</span>
        </span>
        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-muted-foreground tabular-nums">
          <span className="whitespace-nowrap">
            {formatModelPrice(model.pricing.prompt)} / {formatModelPrice(model.pricing.completion)}
          </span>
          <span className="max-w-24 truncate">{compactInputOutput}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                aria-label={`Show details for ${model.name}`}
                className="inline-flex size-4 cursor-help items-center justify-center rounded-sm text-muted-foreground/80 transition-colors hover:text-foreground"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <CircleHelpIcon className="size-2.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <p className="font-medium">{model.name}</p>
              <p className="mt-1 text-xs text-background/80">
                {model.description || "No description available."}
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-background/75">
                <p>
                  Pricing (per 1M tokens): {formatModelPrice(model.pricing.prompt)} in,{" "}
                  {formatModelPrice(model.pricing.completion)} out
                </p>
                {model.modality ? <p>Modality: {model.modality}</p> : null}
                {model.contextLength ? (
                  <p>
                    Context: {formatTokenCount(model.contextLength)}
                    {model.maxCompletionTokens
                      ? ` | Max output: ${formatTokenCount(model.maxCompletionTokens)}`
                      : ""}
                  </p>
                ) : null}
                {model.inputModalities?.length ? (
                  <p>Input: {model.inputModalities.join(", ")}</p>
                ) : null}
                {model.outputModalities?.length ? (
                  <p>Output: {model.outputModalities.join(", ")}</p>
                ) : null}
                {capabilityLabels.length ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {capabilityLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-background/25 px-1.5 py-0.5 text-[10px] text-background/80"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-[10px] text-background/70">{model.modelId}</p>
            </TooltipContent>
          </Tooltip>
        </span>
      </span>

      {selected ? <CheckIcon className="size-2.5 shrink-0 text-foreground" /> : null}
    </button>
  )
}

function ModeSettingsOptionButton({
  mode,
  selected,
  onClick,
}: {
  mode: ModeName
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        selected ? "bg-muted/55" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full bg-muted/35 text-foreground/75",
          selected ? "bg-foreground/8 text-foreground" : null,
        )}
      >
        {selected ? <CheckIcon className="size-2.5" /> : <WandSparklesIcon className="size-2.5" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="truncate text-xs font-medium text-foreground">{mode}</span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="truncate">Prompt behavior</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                aria-label={`Show details for ${mode}`}
                className="inline-flex size-4 cursor-help items-center justify-center rounded-sm text-muted-foreground/80 transition-colors hover:text-foreground"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <CircleHelpIcon className="size-2.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <p className="font-medium">{mode}</p>
              <p className="mt-1 text-xs text-background/80">{getModeDescription(mode)}</p>
            </TooltipContent>
          </Tooltip>
        </span>
      </span>

      {selected ? <CheckIcon className="size-2.5 shrink-0 text-foreground" /> : null}
    </button>
  )
}

function ProjectSettingsOptionButton({
  icon,
  title,
  meta,
  tooltipContent,
  selected = false,
  onClick,
}: {
  icon: ReactNode
  title: string
  meta?: string
  tooltipContent?: string
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        selected ? "bg-muted/55" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full bg-muted/35 text-foreground/75",
          selected ? "bg-foreground/8 text-foreground" : null,
        )}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="truncate text-xs font-medium text-foreground">{title}</span>
        {meta ? (
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="truncate">{meta}</span>
            {tooltipContent ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    aria-label={`Show details for ${title}`}
                    className="inline-flex size-4 cursor-help items-center justify-center rounded-sm text-muted-foreground/80 transition-colors hover:text-foreground"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <CircleHelpIcon className="size-2.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm">
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-xs text-background/80">{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </span>
        ) : null}
      </span>

      {selected ? <CheckIcon className="size-2.5 shrink-0 text-foreground" /> : null}
    </button>
  )
}

function formatCompactInputOutput(model: Doc<"availableModels">): string {
  const context = model.contextLength ? formatTokenCount(model.contextLength) : ""
  const inputModalities = model.inputModalities?.length
    ? model.inputModalities.join(", ")
    : ""
  const outputModalities = model.outputModalities?.length
    ? model.outputModalities.join(", ")
    : ""
  const modalities =
    inputModalities && outputModalities
      ? `${inputModalities}->${outputModalities}`
      : inputModalities || outputModalities || ""

  const parts = [context, modalities].filter(Boolean)
  return parts.join(" · ") || "-"
}
