import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { SettingsIcon } from "lucide-react";
import React from "react";

export default function SettingsPopover({ isSmartContext, setIsSmartContext }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="sm">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-fit">
        <div className="flex flex-row gap-2 items-center text-sm font-medium">
          <p className="text-xs">Smart Context</p>
          <Switch
            checked={isSmartContext}
            onCheckedChange={setIsSmartContext}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
