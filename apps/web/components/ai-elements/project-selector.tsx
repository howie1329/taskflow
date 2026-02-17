import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export type ProjectSelectorProps = ComponentProps<typeof Dialog>;

export const ProjectSelector = (props: ProjectSelectorProps) => (
  <Dialog {...props} />
);

export type ProjectSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ProjectSelectorTrigger = (props: ProjectSelectorTriggerProps) => (
  <DialogTrigger {...props} />
);

export type ProjectSelectorContentProps = ComponentProps<
  typeof DialogContent
> & {
  title?: ReactNode;
};

export const ProjectSelectorContent = ({
  className,
  children,
  title = "Project Selector",
  ...props
}: ProjectSelectorContentProps) => (
  <DialogContent
    className={cn(
      "outline! border-none! p-0 outline-border! outline-solid!",
      className,
    )}
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command className="**:data-[slot=command-input-wrapper]:h-auto">
      {children}
    </Command>
  </DialogContent>
);

export type ProjectSelectorDialogProps = ComponentProps<typeof Command>;

export const ProjectSelectorDialog = (props: ProjectSelectorDialogProps) => (
  <Command {...props} />
);

export type ProjectSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ProjectSelectorInput = ({
  className,
  ...props
}: ProjectSelectorInputProps) => (
  <CommandInput className={cn("h-auto py-3.5", className)} {...props} />
);

export type ProjectSelectorListProps = ComponentProps<typeof CommandList>;

export const ProjectSelectorList = (props: ProjectSelectorListProps) => (
  <CommandList {...props} />
);

export type ProjectSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ProjectSelectorEmpty = (props: ProjectSelectorEmptyProps) => (
  <CommandEmpty {...props} />
);

export type ProjectSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ProjectSelectorGroup = (props: ProjectSelectorGroupProps) => (
  <CommandGroup {...props} />
);

export type ProjectSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ProjectSelectorItem = (props: ProjectSelectorItemProps) => (
  <CommandItem {...props} />
);

export type ProjectSelectorNameProps = ComponentProps<"span">;

export const ProjectSelectorName = ({
  className,
  ...props
}: ProjectSelectorNameProps) => (
  <span className={cn("flex-1 truncate text-left", className)} {...props} />
);
