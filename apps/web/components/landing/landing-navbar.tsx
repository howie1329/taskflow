"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useConvexAuth } from "convex/react"
import { LandingBrand } from "./landing-brand"
import { landingNavLinks } from "./landing-links"

export function LandingNavbar() {
  const { isAuthenticated } = useConvexAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 absolute left-4 top-2 z-50 rounded-md bg-background px-3 py-2 text-xs text-foreground"
      >
        Skip to content
      </a>
      <div className="w-full px-4 lg:px-6">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between">
          <LandingBrand />

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/roadmap"
              className="hidden text-sm font-medium text-muted-foreground transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:block"
            >
              The plan
            </Link>
            {isAuthenticated ? (
              <Link href="/app">
                <Button size="sm" className="marketing-press">
                  To app
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button size="sm" className="marketing-press">
                  Get started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
