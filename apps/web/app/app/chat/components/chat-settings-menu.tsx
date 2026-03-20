"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { ModelSelectorLogo } from "@/components/ai-elements/model-selector";
import type { ModeName } from "@/lib/AITools/ModePrompts";
import { AVAILABLE_MODES, getModeDescription } from "@/lib/AITools/ModePrompts";

import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import {
  CircleHelpIcon,
  CheckIcon,
  CpuIcon,
  FolderIcon,
  GlobeIcon,
  ImageIcon,
  SearchIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react";

export interface ChatSettingsContentProps {
  availableModels: Doc<"availableModels">[];
  selectedModelId: string | null;
  onSelectModel: (model: Doc<"availableModels"> | null) => void;
  selectedMode: ModeName;
  onSelectMode: (mode: ModeName) => void;
  projects: Doc<"projects">[];
  selectedProjectId: string | null;
  onSelectProjectId: (projectId: string | null) => void;
  showImageAction?: boolean;
  onClose?: () => void;
}

export const CHAT_SETTINGS_TRIGGER_CLASS_NAME =
  "rounded-md border-border bg-background text-foreground shadow-none transition-[color,background-color,border-color,transform] duration-150 ease-out hover:bg-muted/50 motion-safe:active:scale-[0.97]";

export const CHAT_SETTINGS_POPOVER_CLASS_NAME =
  "gap-0 overflow-hidden rounded-xl border border-border bg-popover p-0 shadow-md ring-0";

/** List row / menu option: explicit properties, ease-out, light press (popover rows are wide) */
const SETTINGS_MENU_ROW_INTERACTION =
  "transition-[background-color,color,border-color,transform] duration-150 ease-out motion-safe:active:scale-[0.985]";

/** Compact filter chips in model picker */
const SETTINGS_FILTER_CHIP_INTERACTION =
  "transition-[background-color,color,transform] duration-150 ease-out motion-safe:active:scale-[0.97]";

export function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="border-b border-border/20 px-1 py-1.5 last:border-b-0"
      aria-label={title}
    >
      <div className="px-2 pb-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <span className="inline-flex size-4 shrink-0 items-center justify-center text-foreground/80">
            {icon}
          </span>
          <span>{title}</span>
        </div>
      </div>
      <div className="grid gap-0.5">{children}</div>
    </section>
  );
}

export function SettingsEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
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
  selected?: boolean;
  leadingIcon?: ReactNode;
  title: string;
  description?: string;
  meta?: string;
  detail?: string;
  tags?: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 origin-left items-start gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        SETTINGS_MENU_ROW_INTERACTION,
        selected ? "bg-muted/55" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-foreground/70",
          selected ? "bg-foreground/8 text-foreground" : "bg-muted/35",
        )}
      >
        {selected ? <CheckIcon className="size-3.5" /> : leadingIcon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {title}
            </span>
            {meta ? (
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                {meta}
              </span>
            ) : null}
          </span>
          {detail ? (
            <span className="max-w-full shrink-0 rounded-md bg-muted/45 px-2 py-1 text-[10px] font-medium text-foreground/70 sm:max-w-50">
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
                className="rounded-md bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground/65"
              >
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function ModelSettingsList({
  availableModels,
  selectedModelId,
  onSelectModel,
  onClose,
}: Pick<
  ChatSettingsContentProps,
  "availableModels" | "selectedModelId" | "onSelectModel" | "onClose"
>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterface, setSelectedInterface] = useState<"all" | string>(
    "all",
  );

  const interfaces = useMemo(() => {
    const set = new Set(
      availableModels
        .map((m) =>
          typeof m.interface === "string"
            ? m.interface.trim().toLowerCase()
            : null,
        )
        .filter((v): v is string => v !== null),
    );
    return Array.from(set).sort();
  }, [availableModels]);

  const showInterfaceFilter = interfaces.length > 1;

  const filteredModels = useMemo(() => {
    let list = availableModels;

    if (selectedInterface !== "all") {
      const normalizedSelected = selectedInterface.trim().toLowerCase();
      list = list.filter((m) => {
        const iface =
          typeof m.interface === "string"
            ? m.interface.trim().toLowerCase()
            : "";
        return iface === normalizedSelected;
      });
    }

    const seen = new Set<string>();
    list = list.filter((m) => {
      const key = `${m.modelId}::${typeof m.interface === "string" ? m.interface : ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((model) =>
      `${model.name} ${model.provider ?? ""} ${model.interface ?? ""} ${formatInterfaceDisplay(model.interface) ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [availableModels, selectedInterface, searchQuery]);

  return (
    <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-1 py-1">
      {showInterfaceFilter ? (
        <div className="flex flex-wrap gap-1 px-1 pb-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedInterface("all")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium",
              SETTINGS_FILTER_CHIP_INTERACTION,
              selectedInterface === "all"
                ? "bg-muted/55 text-foreground"
                : "bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
          >
            All
          </button>
          {interfaces.map((iface) => (
            <button
              key={iface}
              type="button"
              onClick={() => setSelectedInterface(iface)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium",
                SETTINGS_FILTER_CHIP_INTERACTION,
                selectedInterface === iface
                  ? "bg-muted/55 text-foreground"
                  : "bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              {formatInterfaceDisplay(iface) ?? iface}
            </button>
          ))}
        </div>
      ) : null}
      <div className="px-1 pb-1 pt-0.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search models..."
            className="h-8 rounded-md border-border/40 bg-muted/20 pl-8 text-sm"
          />
        </div>
      </div>
      <SettingsSection
        icon={<SparklesIcon className="size-4" />}
        title="Model"
      >
        {availableModels.length === 0 ? (
          <SettingsEmptyState>
            No models available right now.
          </SettingsEmptyState>
        ) : filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <ModelSettingsOptionButton
              key={model._id}
              model={model}
              selected={model.modelId === selectedModelId}
              onClick={() => {
                onSelectModel(model);
                onClose?.();
              }}
            />
          ))
        ) : (
          <SettingsEmptyState>No models found</SettingsEmptyState>
        )}
      </SettingsSection>
    </div>
  );
}

export function ModeSettingsList({
  selectedMode,
  onSelectMode,
  onClose,
}: Pick<
  ChatSettingsContentProps,
  "selectedMode" | "onSelectMode" | "onClose"
>) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredModes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return AVAILABLE_MODES;

    return AVAILABLE_MODES.filter((mode) => mode.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-1 py-1">
      <div className="px-1 pb-1 pt-0.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search modes..."
            className="h-8 rounded-md border-border/40 bg-muted/20 pl-8 text-sm"
          />
        </div>
      </div>
      <SettingsSection
        icon={<WandSparklesIcon className="size-4" />}
        title="Mode"
      >
        {filteredModes.length > 0 ? (
          filteredModes.map((mode) => (
            <ModeSettingsOptionButton
              key={mode}
              mode={mode}
              selected={mode === selectedMode}
              onClick={() => {
                onSelectMode(mode);
                onClose?.();
              }}
            />
          ))
        ) : (
          <SettingsEmptyState>No modes found</SettingsEmptyState>
        )}
      </SettingsSection>
    </div>
  );
}

export function ProjectSettingsList({
  projects,
  selectedProjectId,
  onSelectProjectId,
  showImageAction = false,
  onClose,
}: Pick<
  ChatSettingsContentProps,
  | "projects"
  | "selectedProjectId"
  | "onSelectProjectId"
  | "showImageAction"
  | "onClose"
>) {
  const attachments = usePromptInputAttachments();
  const selectedProject =
    projects.find((project) => project._id === selectedProjectId) ?? null;
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((project) =>
      project.title.toLowerCase().includes(query),
    );
  }, [projects, searchQuery]);

  return (
    <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-1 py-1">
      <div className="px-1 pb-1 pt-0.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects..."
            className="h-8 rounded-md border-border/40 bg-muted/20 pl-8 text-sm"
          />
        </div>
      </div>
      <SettingsSection
        icon={
          selectedProject ? (
            <FolderIcon className="size-4" />
          ) : (
            <GlobeIcon className="size-4" />
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
            onSelectProjectId(null);
            onClose?.();
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
                onSelectProjectId(project._id);
                onClose?.();
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
                attachments.openFileDialog();
                onClose?.();
              }}
            />
          </div>
        ) : null}
      </SettingsSection>
    </div>
  );
}

function formatModelPrice(pricePerTokenUsd: string, decimals = 2): string {
  const parsed = Number(pricePerTokenUsd);
  if (!Number.isFinite(parsed)) return "-";
  return `$${(parsed * 1_000_000).toFixed(decimals)}`;
}

export function formatInterfaceDisplay(
  interfaceType?: string,
): string | undefined {
  if (!interfaceType) return undefined;
  if (interfaceType === "openrouter") return "OpenRouter";
  if (interfaceType === "groq") return "Groq";
  if (interfaceType === "cerebras") return "Cerebras";
  if (interfaceType === "vercel") return "Vercel";
  return interfaceType;
}

export function buildModelMeta(
  model: Doc<"availableModels">,
): string | undefined {
  const parts = [
    formatInterfaceDisplay(model.interface),
    model.provider,
    model.contextLength
      ? `${formatTokenCount(model.contextLength)} context`
      : null,
    model.modality,
  ].filter(Boolean);

  return parts.length ? parts.join(" • ") : undefined;
}

function formatTokenCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "-";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${trimTrailingZeros(millions)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${trimTrailingZeros(thousands)}k`;
  }
  return String(value);
}

function trimTrailingZeros(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

export function getCapabilityLabels(supportedParameters?: string[]): string[] {
  if (!supportedParameters?.length) return [];

  const params = new Set(supportedParameters);
  const labels: string[] = [];

  if (params.has("tools") || params.has("tool_choice")) labels.push("Tools");
  if (params.has("structured_outputs") || params.has("response_format")) {
    labels.push("Structured");
  }
  if (params.has("reasoning") || params.has("include_reasoning")) {
    labels.push("Reasoning");
  }
  if (params.has("seed")) labels.push("Seed");
  if (params.has("temperature") || params.has("top_p")) labels.push("Sampling");
  if (params.has("stop")) labels.push("Stops");

  return labels;
}

function ModelSettingsOptionButton({
  model,
  selected,
  onClick,
}: {
  model: Doc<"availableModels">;
  selected: boolean;
  onClick: () => void;
}) {
  const compactInputOutput = formatCompactInputOutput(model);
  const capabilityLabels = getCapabilityLabels(model.supportedParameters);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 origin-left items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        SETTINGS_MENU_ROW_INTERACTION,
        selected ? "bg-muted/55" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-md bg-muted/35 text-foreground/75",
          selected ? "bg-foreground/8 text-foreground" : null,
        )}
      >
        {model.interface === "groq" ? (
          <ModelSelectorLogo provider="groq" className="size-2.5" />
        ) : model.interface === "openrouter" ? (
          <ModelSelectorLogo provider="openrouter" className="size-2.5" />
        ) : model.provider ? (
          <ModelSelectorLogo provider={model.provider} className="size-2.5" />
        ) : selected ? (
          <CheckIcon className="size-2.5" />
        ) : (
          <CpuIcon className="size-2.5" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {model.name}
          </span>
          {formatInterfaceDisplay(model.interface) ? (
            <span className="shrink-0 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {formatInterfaceDisplay(model.interface)}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-muted-foreground tabular-nums">
          <span className="whitespace-nowrap">
            {formatModelPrice(model.pricing.prompt)} /{" "}
            {formatModelPrice(model.pricing.completion)}
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
              {formatInterfaceDisplay(model.interface) ? (
                <p className="mt-0.5 text-[11px] text-background/70">
                  Interface: {formatInterfaceDisplay(model.interface)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-background/80">
                {model.description || "No description available."}
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-background/75">
                <p>
                  Pricing (per 1M tokens):{" "}
                  {formatModelPrice(model.pricing.prompt)} in,{" "}
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
              <p className="mt-2 text-[10px] text-background/70">
                {model.modelId}
              </p>
            </TooltipContent>
          </Tooltip>
        </span>
      </span>

      {selected ? (
        <CheckIcon className="size-2.5 shrink-0 text-foreground" />
      ) : null}
    </button>
  );
}

function ModeSettingsOptionButton({
  mode,
  selected,
  onClick,
}: {
  mode: ModeName;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 origin-left items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        SETTINGS_MENU_ROW_INTERACTION,
        selected ? "bg-muted/55" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-md bg-muted/35 text-foreground/75",
          selected ? "bg-foreground/8 text-foreground" : null,
        )}
      >
        {selected ? (
          <CheckIcon className="size-2.5" />
        ) : (
          <WandSparklesIcon className="size-2.5" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="truncate text-sm font-medium text-foreground">
          {mode}
        </span>
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
              <p className="mt-1 text-xs text-background/80">
                {getModeDescription(mode)}
              </p>
            </TooltipContent>
          </Tooltip>
        </span>
      </span>

      {selected ? (
        <CheckIcon className="size-2.5 shrink-0 text-foreground" />
      ) : null}
    </button>
  );
}

function ProjectSettingsOptionButton({
  icon,
  title,
  meta,
  tooltipContent,
  selected = false,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  meta?: string;
  tooltipContent?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 origin-left items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        SETTINGS_MENU_ROW_INTERACTION,
        selected ? "bg-muted/55" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-md bg-muted/35 text-foreground/75",
          selected ? "bg-foreground/8 text-foreground" : null,
        )}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
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
                  <p className="mt-1 text-xs text-background/80">
                    {tooltipContent}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </span>
        ) : null}
      </span>

      {selected ? (
        <CheckIcon className="size-2.5 shrink-0 text-foreground" />
      ) : null}
    </button>
  );
}

function formatCompactInputOutput(model: Doc<"availableModels">): string {
  const context = model.contextLength
    ? formatTokenCount(model.contextLength)
    : "";
  const inputModalities = model.inputModalities?.length
    ? model.inputModalities.join(", ")
    : "";
  const outputModalities = model.outputModalities?.length
    ? model.outputModalities.join(", ")
    : "";
  const modalities =
    inputModalities && outputModalities
      ? `${inputModalities}->${outputModalities}`
      : inputModalities || outputModalities || "";

  const parts = [context, modalities].filter(Boolean);
  return parts.join(" · ") || "-";
}
