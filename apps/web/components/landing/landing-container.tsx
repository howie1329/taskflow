import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LandingContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
}

const sizeClasses = {
  default: "max-w-6xl",
  sm: "max-w-4xl",
  lg: "max-w-[90rem]",
};

export function LandingContainer({
  children,
  className,
  size = "default",
}: LandingContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 lg:px-8",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
