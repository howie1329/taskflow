"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="container px-4 py-8 lg:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-none font-mono text-xs"
            >
              Taskflow
            </Badge>
            <span className="text-xs text-muted-foreground">v1 rewrite</span>
          </div>

          <nav className="flex items-center gap-6 text-xs">
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
            <Link
              href="/app"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Open app
            </Link>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            Solo AI-assisted workplace. Built with Next.js, Convex, and
            shadcn/ui.
          </p>
          <p className="text-[10px] text-muted-foreground">
            Convex-powered backend. Clerk authentication.
          </p>
        </div>
      </div>
    </footer>
  );
}
