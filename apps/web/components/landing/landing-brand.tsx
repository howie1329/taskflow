import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type LandingBrandProps = {
  href?: string
  className?: string
  labelClassName?: string
  iconClassName?: string
}

export function LandingBrand({
  href = "/",
  className,
  labelClassName,
  iconClassName,
}: LandingBrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium text-foreground transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center overflow-hidden",
          iconClassName
        )}
      >
        <Image
          src="/brand/taskflow-mark-dark.svg"
          alt="Taskflow"
          width={28}
          height={28}
          className="size-7"
        />
      </span>
      <span className={cn("font-medium tracking-tight", labelClassName)}>
        Taskflow
      </span>
    </Link>
  )
}
