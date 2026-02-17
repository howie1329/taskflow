import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export type ModeSelectorProps = ComponentProps<typeof Dialog>;

export const ModeSelector = (props: ModeSelectorProps) => <Dialog {...props} />;

export type ModeSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ModeSelectorTrigger = (props: ModeSelectorTriggerProps) => (
  <DialogTrigger {...props} />
);

export type ModeSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

export const ModeSelectorContent = ({
  className,
  children,
  title = "Mode Selector",
  ...props
}: ModeSelectorContentProps) => (
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

export type ModeSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModeSelectorDialog = (props: ModeSelectorDialogProps) => (
  <CommandDialog {...props} />
);

export type ModeSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModeSelectorInput = ({
  className,
  ...props
}: ModeSelectorInputProps) => (
  <CommandInput className={cn("h-auto py-3.5", className)} {...props} />
);

export type ModeSelectorListProps = ComponentProps<typeof CommandList>;

export const ModeSelectorList = (props: ModeSelectorListProps) => (
  <CommandList {...props} />
);

export type ModeSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModeSelectorEmpty = (props: ModeSelectorEmptyProps) => (
  <CommandEmpty {...props} />
);

export type ModeSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModeSelectorGroup = (props: ModeSelectorGroupProps) => (
  <CommandGroup {...props} />
);

export type ModeSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModeSelectorItem = (props: ModeSelectorItemProps) => (
  <CommandItem {...props} />
);

export type ModeSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModeSelectorShortcut = (props: ModeSelectorShortcutProps) => (
  <CommandShortcut {...props} />
);

export type ModeSelectorSeparatorProps = ComponentProps<
  typeof CommandSeparator
>;

export const ModeSelectorSeparator = (props: ModeSelectorSeparatorProps) => (
  <CommandSeparator {...props} />
);

export type ModeSelectorNameProps = ComponentProps<"span">;

export const ModeSelectorName = ({
  className,
  ...props
}: ModeSelectorNameProps) => (
  <span className={cn("flex-1 truncate text-left", className)} {...props} />
);

export type ModeSelectorDescriptionProps = ComponentProps<"span">;

export const ModeSelectorDescription = ({
  className,
  ...props
}: ModeSelectorDescriptionProps) => (
  <span
    className={cn("text-xs text-muted-foreground truncate", className)}
    {...props}
  />
);
