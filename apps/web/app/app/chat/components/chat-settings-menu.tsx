"use client"

import { useMemo, useState, type ReactNode } from "react"
import type { Doc } from "@/convex/_generated/dataModel"
import type { ModeName } from "@/lib/AITools/ModePrompts"
import { AVAILABLE_MODES, getModeDescription } from "@/lib/AITools/ModePrompts"
import { formatModelPrice } from "./format-model-price"
import { Button } from "@/components/ui/button"
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
  CheckIcon,
  CpuIcon,
  FolderCogIcon,
  FolderIcon,
  GlobeIcon,
  ImageIcon,
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
              {triggerIcon ?? <SlidersHorizontalIcon className="size-3.5 shrink-0" />}
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
              icon={<SparklesIcon className="size-3" />}
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
    <section className="border-b border-border/20 px-1 py-2 last:border-b-0" aria-label={title}>
      <div className="px-2 pb-2 pt-1">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
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
    <div className="rounded-2xl bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
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
  return (
    <div className="max-h-[min(60vh,34rem)] overflow-y-auto overscroll-contain px-2 py-2">
      <SettingsSection
        icon={<SparklesIcon className="size-3.5" />}
        title="Model"
      >
        {availableModels.length > 0 ? (
          availableModels.map((model) => (
            <SettingsOptionButton
              key={model.modelId}
              selected={model.modelId === selectedModelId}
              leadingIcon={<CpuIcon className="size-3.5" />}
              title={model.name}
              description={model.description || "No description available."}
              meta={buildModelMeta(model)}
              tags={getCapabilityLabels(model.supportedParameters)}
              detail={`${formatModelPrice(model.pricing.prompt)} in / ${formatModelPrice(model.pricing.completion)} out`}
              onClick={() => {
                onSelectModelId(model.modelId)
                onClose?.()
              }}
            />
          ))
        ) : (
          <SettingsEmptyState>
            No models available right now.
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
  return (
    <div className="max-h-[min(60vh,34rem)] overflow-y-auto overscroll-contain px-2 py-2">
      <SettingsSection
        icon={<WandSparklesIcon className="size-3.5" />}
        title="Mode"
      >
        {AVAILABLE_MODES.map((mode) => (
          <SettingsOptionButton
            key={mode}
            selected={mode === selectedMode}
            title={mode}
            description={getModeDescription(mode)}
            detail="Prompt behavior"
            onClick={() => {
              onSelectMode(mode)
              onClose?.()
            }}
          />
        ))}
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

  return (
    <div className="max-h-[min(60vh,34rem)] overflow-y-auto overscroll-contain px-2 py-2">
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
        <SettingsOptionButton
          selected={selectedProjectId === null}
          title="No project"
          description="Use the full workspace"
          detail="Workspace scope"
          onClick={() => {
            onSelectProjectId(null)
            onClose?.()
          }}
        />
        {projects.map((project) => (
          <SettingsOptionButton
            key={project._id}
            selected={project._id === selectedProjectId}
            title={`${project.icon} ${project.title}`}
            detail="Project scope"
            onClick={() => {
              onSelectProjectId(project._id)
              onClose?.()
            }}
          />
        ))}
        {showImageAction ? (
          <div className="mt-2 border-t border-border/15 px-2 pt-3">
            <SettingsOptionButton
              leadingIcon={<ImageIcon className="size-3.5" />}
              title="Add image"
              description="Attach an image to your message"
              detail="Upload"
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
