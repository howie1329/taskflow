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
        "flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
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
          src="/favicon-32x32.png"
          alt="Taskflow"
          width={18}
          height={18}
          className="size-[18px]"
        />
      </span>
      <span className={cn("font-medium tracking-tight", labelClassName)}>
        Taskflow
      </span>
    </Link>
  )
}
