"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import { CircleHelp } from "lucide-react"
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorItem,
  ModelSelectorGroup,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatModelPrice } from "./format-model-price"

interface ModelSelectorMenuProps {
  availableModels: Doc<"availableModels">[]
  selectedModelId: string | null
  onSelectModelId: (modelId: string | null) => void
  triggerClassName?: string
}

export function ModelSelectorMenu({
  availableModels,
  selectedModelId,
  onSelectModelId,
  triggerClassName = "h-7 rounded-full border border-border/60 bg-muted/30 px-2.5 text-xs font-medium text-foreground hover:bg-muted/60",
}: ModelSelectorMenuProps) {
  if (availableModels.length === 0) return null

  return (
    <ModelSelector>
      <ModelSelectorTrigger className={triggerClassName}>
        <ModelSelectorName>
          {availableModels.find((model) => model.modelId === selectedModelId)
            ?.name ?? "Select model"}
        </ModelSelectorName>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorGroup heading="Available Models">
            {availableModels.map((model) => {
              const capabilityLabels = getCapabilityLabels(model.supportedParameters)

              return (
                <Tooltip key={model.modelId}>
                  <ModelSelectorItem
                    value={`${model.modelId} ${model.name} ${model.provider ?? ""}`}
                    onSelect={() => onSelectModelId(model.modelId)}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {model.provider ? (
                          <ModelSelectorLogo provider={model.provider} />
                        ) : null}
                        <ModelSelectorName>{model.name}</ModelSelectorName>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span>
                          {formatModelPrice(model.pricing.prompt)} in /{" "}
                          {formatModelPrice(model.pricing.completion)} out
                        </span>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Show details for ${model.name}`}
                            className="inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                          >
                            <CircleHelp className="size-3" />
                          </button>
                        </TooltipTrigger>
                      </div>
                    </div>
                  </ModelSelectorItem>
                  <TooltipContent side="right" className="max-w-sm">
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
                    <p className="mt-2 text-[10px] text-background/70">
                      {model.modelId}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
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

function getCapabilityLabels(supportedParameters?: string[]): string[] {
  if (!supportedParameters?.length) return []

  const params = new Set(supportedParameters)
  const labels: string[] = []

  if (params.has("tools") || params.has("tool_choice")) labels.push("Tools")
  if (params.has("structured_outputs") || params.has("response_format")) {
    labels.push("Structured outputs")
  }
  if (params.has("reasoning") || params.has("include_reasoning")) {
    labels.push("Reasoning")
  }
  if (params.has("seed")) labels.push("Seed")
  if (params.has("temperature") || params.has("top_p")) labels.push("Sampling")
  if (params.has("stop")) labels.push("Stop sequences")

  return labels
}
