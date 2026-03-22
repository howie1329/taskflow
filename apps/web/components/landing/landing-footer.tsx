import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { LandingContainer } from "./landing-container"
import { LandingBrand } from "./landing-brand"
import { landingFooterLinks } from "./landing-links"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/40">
      <LandingContainer className="py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <LandingBrand
              className="gap-2"
              iconClassName="size-7 rounded-md"
              labelClassName="text-sm"
            />
            <span className="text-xs text-muted-foreground">v1</span>
          </div>

          <nav className="flex items-center gap-6 text-xs">
            {landingFooterLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="text-sm font-medium text-muted-foreground transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Open app
            </Link>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-pretty text-xs text-muted-foreground">
            Solo AI-assisted workplace. Built with Next.js, Convex, and
            shadcn/ui.
          </p>
          <p className="text-pretty text-[10px] text-muted-foreground">
            Convex-powered backend.
          </p>
        </div>
      </LandingContainer>
    </footer>
  )
}
