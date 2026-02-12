"use client"

import type { Doc } from "@/convex/_generated/dataModel"
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
  priceDecimals: number
  triggerClassName?: string
}

export function ModelSelectorMenu({
  availableModels,
  selectedModelId,
  onSelectModelId,
  priceDecimals,
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
            {availableModels.map((model) => (
              <Tooltip key={model.modelId}>
                <TooltipTrigger asChild>
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
                      <div className="shrink-0 text-[10px] text-muted-foreground">
                        {formatModelPrice(model.pricing.prompt, priceDecimals)} /{" "}
                        {formatModelPrice(
                          model.pricing.completion,
                          priceDecimals,
                        )}
                      </div>
                    </div>
                  </ModelSelectorItem>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p className="font-medium">{model.name}</p>
                  <p className="mt-1 text-xs text-background/80">
                    {model.description || "No description available."}
                  </p>
                  <p className="mt-2 text-[10px] text-background/70">
                    {model.modelId}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
}
