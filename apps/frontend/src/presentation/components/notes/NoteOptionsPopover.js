import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { EllipsisIcon } from "lucide-react";

export const NoteOptionsPopover = ({
  title,
  description,
  handleDeleteNote,
  handleSaveNote,
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <EllipsisIcon className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent
        side="left"
        sideOffset={10}
        align="start"
        alignOffset={5}
        className="grid grid-rows-[20px_25px_25px_1fr_25px] bg-card h-[200px] p-0 shadow-md"
      >
        <div className="row-span-1 flex flex-col items-center justify-center ">
          <p className="text-xs font-medium">Note Options</p>
          <Separator />
        </div>
        <div className="row-span-1  flex items-center justify-center ">
          <Input
            type="text"
            className="text-xs h-[95%] w-full border-none shadow-none text-center "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="row-span-1 flex items-center justify-center">
          <Input
            type="text"
            className="text-xs h-[95%] w-full border-none shadow-none text-center"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="row-span-1">
          {/* For linking tasks, projects, tags, etc. */}
        </div>
        <div className="row-span-1  flex items-center justify-evenly gap-2 ">
          <Button
            variant="outline"
            className="text-xs h-2 w-[45%]"
            onClick={handleDeleteNote}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            className="text-xs h-2 w-[45%]"
            onClick={handleSaveNote}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
