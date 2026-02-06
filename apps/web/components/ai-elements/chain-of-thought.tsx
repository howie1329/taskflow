"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  DotIcon,
  CheckCircle2,
  Loader2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";
import { ProviderBadge, TimingBadge, ProviderType } from "./provider-badge";

interface ChainOfThoughtContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(
  null,
);

const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error(
      "ChainOfThought components must be used within ChainOfThought",
    );
  }
  return context;
};

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ChainOfThought = memo(
  ({
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    const chainOfThoughtContext = useMemo(
      () => ({ isOpen, setIsOpen }),
      [isOpen, setIsOpen],
    );

    return (
      <ChainOfThoughtContext.Provider value={chainOfThoughtContext}>
        <div className={cn("not-prose max-w-prose", className)} {...props}>
          {children}
        </div>
      </ChainOfThoughtContext.Provider>
    );
  },
);

export type ChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
>;

export type EnhancedChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  totalSteps: number;
  totalDuration?: number;
  providers?: ProviderType[];
};

export const EnhancedChainOfThoughtHeader = memo(
  function EnhancedChainOfThoughtHeader({
    className,
    children,
    totalSteps,
    totalDuration,
    providers,
    ...props
  }: EnhancedChainOfThoughtHeaderProps) {
    const { isOpen, setIsOpen } = useChainOfThought();

    const uniqueProviders = useMemo(() => {
      if (!providers) return [];
      return [...new Set(providers)];
    }, [providers]);

    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            className,
          )}
          {...props}
        >
          <ChevronDownIcon
            className={cn(
              "size-3.5 transition-transform",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          />
          <span className="flex-1 text-left text-xs flex items-center gap-2">
            {children ?? "Actions"}
            <Badge
              className="rounded-full px-1.5 py-0 text-[10px] font-medium"
              variant="secondary"
            >
              {totalSteps}
            </Badge>
            {totalDuration !== undefined && (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
                · {Math.round((totalDuration / 1000) * 10) / 10}s total
              </span>
            )}
          </span>
          {uniqueProviders.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {uniqueProviders.slice(0, 3).map((provider, i) => (
                <ProviderBadge
                  key={i}
                  toolName={provider}
                  showName={false}
                  size="sm"
                />
              ))}
              {uniqueProviders.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{uniqueProviders.length - 3}
                </span>
              )}
            </div>
          )}
        </CollapsibleTrigger>
      </Collapsible>
    );
  },
);

export const ChainOfThoughtHeader = memo(
  ({ className, children, ...props }: ChainOfThoughtHeaderProps) => {
    const { isOpen, setIsOpen } = useChainOfThought();

    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            className,
          )}
          {...props}
        >
          <ChevronDownIcon
            className={cn(
              "size-3.5 transition-transform",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          />
          <span className="flex-1 text-left text-xs">
            {children ?? "Actions"}
          </span>
        </CollapsibleTrigger>
      </Collapsible>
    );
  },
);

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
  duration?: number;
  toolName?: string;
};

const StatusIcon = ({
  status,
}: {
  status: "complete" | "active" | "pending";
}) => {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="size-3.5 text-emerald-500" />;
    case "active":
      return <Loader2 className="size-3.5 text-amber-500 animate-spin" />;
    case "pending":
      return <Circle className="size-3.5 text-slate-400" />;
    default:
      return <DotIcon className="size-3.5" />;
  }
};

export const ChainOfThoughtStep = memo(
  ({
    className,
    icon: Icon,
    label,
    description,
    status = "complete",
    duration,
    toolName,
    children,
    ...props
  }: ChainOfThoughtStepProps) => {
    const statusStyles = {
      complete: "text-foreground",
      active: "text-foreground",
      pending: "text-muted-foreground/50",
    };

    return (
      <div
        className={cn(
          "flex gap-2 text-xs py-1",
          statusStyles[status],
          "fade-in animate-in",
          className,
        )}
        {...props}
      >
        <div className="mt-0.5 shrink-0">
          {Icon ? (
            <Icon className="size-3.5" />
          ) : (
            <StatusIcon status={status} />
          )}
        </div>
        <div className="flex-1 space-y-1 overflow-hidden min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{label}</span>
            {duration !== undefined && status === "complete" && (
              <TimingBadge duration={duration} size="sm" />
            )}
            {toolName && (
              <ProviderBadge toolName={toolName} showName={false} size="sm" />
            )}
          </div>
          {description && (
            <div className="text-muted-foreground/80">{description}</div>
          )}
          {children}
        </div>
      </div>
    );
  },
);

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;

export const ChainOfThoughtSearchResults = memo(
  ({ className, ...props }: ChainOfThoughtSearchResultsProps) => (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  ),
);

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;

export const ChainOfThoughtSearchResult = memo(
  ({ className, children, ...props }: ChainOfThoughtSearchResultProps) => (
    <Badge
      className={cn("gap-1 px-2 py-0.5 font-normal text-xs", className)}
      variant="secondary"
      {...props}
    >
      {children}
    </Badge>
  ),
);

export type ChainOfThoughtContentProps = ComponentProps<
  typeof CollapsibleContent
>;

export const ChainOfThoughtContent = memo(
  ({ className, children, ...props }: ChainOfThoughtContentProps) => {
    const { isOpen } = useChainOfThought();

    return (
      <Collapsible open={isOpen}>
        <CollapsibleContent
          className={cn(
            "space-y-2",
            "data-[state=closed]:animate-out data-[state=open]:animate-in",
            className,
          )}
          {...props}
        >
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

export type ChainOfThoughtImageProps = ComponentProps<"div"> & {
  caption?: string;
};

export const ChainOfThoughtImage = memo(
  ({ className, children, caption, ...props }: ChainOfThoughtImageProps) => (
    <div className={cn("mt-2 space-y-2", className)} {...props}>
      <div className="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-muted p-3">
        {children}
      </div>
      {caption && <p className="text-muted-foreground text-xs">{caption}</p>}
    </div>
  ),
);

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
