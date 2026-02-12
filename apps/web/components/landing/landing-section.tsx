import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LandingSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  withBorder?: boolean;
  withBackground?: boolean;
  variant?: "default" | "hero" | "compact";
}

const variantClasses = {
  default: "py-16 lg:py-24",
  hero: "pt-16 pb-20 lg:pt-20 lg:pb-28",
  compact: "py-12 lg:py-16",
};

export function LandingSection({
  children,
  id,
  className,
  withBorder = false,
  withBackground = false,
  variant = "default",
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full",
        withBorder && "border-t",
        variantClasses[variant],
        className,
      )}
    >
      {withBackground && (
        <>
          <div className="absolute inset-0 landing-radial-wash" />
          <div className="absolute inset-0 landing-grid-bg opacity-50" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
