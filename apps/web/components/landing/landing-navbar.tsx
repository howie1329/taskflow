"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useConvexAuth } from "convex/react";
import { landingNavLinks } from "./landing-links";

export function LandingNavbar() {
  const { isAuthenticated } = useConvexAuth();

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
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 font-mono text-[11px]"
            >
              Taskflow
            </Badge>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-medium md:flex">
            {landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/roadmap"
              className="hidden text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:block"
            >
              The Plan
            </Link>
            {isAuthenticated ? (
              <Link href="/app">
                <Button size="sm">To App</Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
