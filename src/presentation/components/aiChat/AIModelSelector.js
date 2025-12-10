import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import { useChatModelContext } from "./providers/ChatModelProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons/index";

export const AIModelSelector = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { availableModels, isLoading, error, selectedModel, setSelectedModel } =
    useChatModelContext();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          disabled={isLoading || error}
          onClick={() => setOpen(true)}
          className=" max-w-fit p-0"
        >
          <p className="truncate text-sm p-0">
            {selectedModel ? selectedModel : "Select Model"}
          </p>
          <HugeiconsIcon icon={ArrowDown01Icon} size={20} strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[500px] max-h-[300px] overflow-y-auto p-2 w-full">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex flex-row items-center border rounded-sm text-sm">
            <input
              type="text"
              placeholder="Search Model..."
              className="w-full focus:outline-none focus:ring-0 text-sm text-center"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search.length > 0 && (
              <HugeiconsIcon
                icon={CancelCircleIcon}
                size={20}
                strokeWidth={2}
                className="w-4 h-4 cursor-pointer"
                onClick={() => setSearch("")}
              />
            )}
          </div>
          <Separator />
        </div>
        <div className="flex flex-col gap-1.5">
          {availableModels &&
            availableModels
              .filter((model) =>
                model.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((model) => (
                <Button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.name);
                    setOpen(false);
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full flex flex-row items-center justify-between pl-2"
                >
                  <div className="flex flex-col items-start justify-between ">
                    <p className="truncate">{model.name}</p>
                    <div className="flex flex-row space-x-2">
                      <p className="text-xs">
                        {(model.pricing.prompt * 1000000).toFixed(3)}
                        USD / 1M tokens
                      </p>
                      <Tooltip>
                        <TooltipTrigger>
                          <HugeiconsIcon
                            icon={AlertCircleIcon}
                            size={20}
                            strokeWidth={2}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-row gap-1 items-center justify-start">
                            {model.architecture.input_modalities &&
                              model.architecture.input_modalities.map(
                                (modality) => (
                                  <p className="text-xs" key={modality}>
                                    {modality.charAt(0).toUpperCase() +
                                      modality.slice(1)}
                                  </p>
                                )
                              )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </Button>
              ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
