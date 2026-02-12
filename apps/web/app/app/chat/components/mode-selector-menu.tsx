"use client"

import type { ModeName } from "@/lib/AITools/ModePrompts"
import { AVAILABLE_MODES, getModeDescription } from "@/lib/AITools/ModePrompts"
import {
  ModeSelector,
  ModeSelectorTrigger,
  ModeSelectorContent,
  ModeSelectorInput,
  ModeSelectorList,
  ModeSelectorItem,
  ModeSelectorGroup,
  ModeSelectorName,
  ModeSelectorDescription,
} from "@/components/ai-elements/mode-selector"

interface ModeSelectorMenuProps {
  selectedMode: ModeName
  onSelectMode: (mode: ModeName) => void
  triggerClassName?: string
}

export function ModeSelectorMenu({
  selectedMode,
  onSelectMode,
  triggerClassName = "h-7 px-2 text-[11px]",
}: ModeSelectorMenuProps) {
  return (
    <ModeSelector>
      <ModeSelectorTrigger className={triggerClassName}>
        <ModeSelectorName>{selectedMode}</ModeSelectorName>
      </ModeSelectorTrigger>
      <ModeSelectorContent>
        <ModeSelectorInput placeholder="Search modes..." />
        <ModeSelectorList>
          <ModeSelectorGroup heading="Available Modes">
            {AVAILABLE_MODES.map((mode) => (
              <ModeSelectorItem
                key={mode}
                value={mode}
                onSelect={() => onSelectMode(mode)}
              >
                <div className="flex flex-col items-start">
                  <ModeSelectorName>{mode}</ModeSelectorName>
                  <ModeSelectorDescription>
                    {getModeDescription(mode)}
                  </ModeSelectorDescription>
                </div>
              </ModeSelectorItem>
            ))}
          </ModeSelectorGroup>
        </ModeSelectorList>
      </ModeSelectorContent>
    </ModeSelector>
  )
}
