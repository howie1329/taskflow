"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <Badge variant="secondary" className="rounded-none font-mono text-xs">
            Taskflow
          </Badge>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium md:flex">
          <a
            href="#workflow"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Workflow
          </a>
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#ai"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            AI
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#goals"
            className="hidden text-xs text-muted-foreground hover:text-foreground sm:block"
          >
            The plan
          </a>
          <Link href="/sign-in">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
