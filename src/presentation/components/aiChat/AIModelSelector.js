import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useFetchModelSelector from "@/hooks/ai/useFetchModelSelector";
import { CheckIcon, ChevronDownIcon, InfoIcon } from "lucide-react";
import React, { Suspense, useState } from "react";

export const AIModelSelector = ({ value, setValue }) => {
  const { data: modelSelector } = useFetchModelSelector();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="h-6">
              {value ? value : "Select Model"}{" "}
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[225px] p-0">
            <Command>
              <CommandInput placeholder="Search Model..." />
              <CommandList>
                <CommandEmpty> No model Found.</CommandEmpty>
                <CommandGroup>
                  {modelSelector?.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={(currentValue) => {
                        setIsOpen(false);
                        setValue(currentValue);
                      }}
                    >
                      {model.name}
                      <Tooltip key={"description"}>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[175px]">
                          {model.description}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip key={"pricing"}>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[175px]">
                          <p>
                            Pricing:{" "}
                            {model.pricing?.prompt
                              ? (model.pricing.prompt * 1000000).toFixed(4)
                              : "N/A"}
                            /m tokens
                          </p>{" "}
                          Context Length:
                          {model.context_length} Tokens
                        </TooltipContent>
                      </Tooltip>
                      {model.id === value && <CheckIcon className="w-4 h-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </Suspense>
  );
};
