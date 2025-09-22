import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SettingsIcon } from "lucide-react";
import React from "react";

export default function SettingsPopover({
  isSmartContext,
  setIsSmartContext,
  contextWindow,
  setContextWindow,
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="sm">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px]">
        <div className="flex flex-row gap-2 items-center justify-between text-sm font-medium">
          <p className="text-xs">Smart Context</p>
          <Switch
            checked={isSmartContext}
            onCheckedChange={setIsSmartContext}
          />
        </div>
        <div className="flex flex-row gap-2 items-center justify-between text-sm font-medium">
          <p className="text-xs">Context Window</p>
          <Slider
            defaultValue={[4]}
            max={12}
            min={2}
            value={[contextWindow]}
            onValueChange={setContextWindow}
          />
          <p className="text-xs">{contextWindow}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
