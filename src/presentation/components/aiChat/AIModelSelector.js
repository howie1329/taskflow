import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useFetchModelSelector from "@/hooks/ai/useFetchModelSelector";
import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";

export const AIModelSelector = ({ setValue, modelName, setModelName }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: modelSelector } = useFetchModelSelector();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className=" max-w-fit p-0"
        >
          <p className="truncate text-sm p-0">
            {modelName ? modelName : "Select Model"}
          </p>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[250px] max-h-[250px] overflow-y-auto p-0">
        <div className="p-2">
          <input
            type="text"
            placeholder="Search Model..."
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {modelSelector &&
          modelSelector
            .filter((model) =>
              model.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((model) => (
              <Button
                key={model.id}
                onClick={() => {
                  setValue(model.id);
                  setModelName(model.name);
                  setOpen(false);
                }}
                variant="ghost"
                size="sm"
              >
                <p className="truncate ">{model.name}</p>
              </Button>
            ))}
      </PopoverContent>
    </Popover>
  );
};
