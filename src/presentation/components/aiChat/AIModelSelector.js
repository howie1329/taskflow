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
import useFetchModelSelector from "@/hooks/ai/useFetchModelSelector";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import React, { Suspense, useState } from "react";

export const AIModelSelector = () => {
  const { data: modelSelector } = useFetchModelSelector();
  const [selectedModel, setSelectedModel] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox">
              {value ? value : "Select Model"}{" "}
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
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
                        setSelectedModel(currentValue);
                        setIsOpen(false);
                        setValue(currentValue);
                      }}
                    >
                      {model.name}{" "}
                      {model.id === selectedModel && (
                        <CheckIcon className="w-4 h-4" />
                      )}
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
