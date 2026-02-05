"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="w-full px-4 py-8 lg:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-md font-mono text-xs"
              >
                Taskflow
              </Badge>
              <span className="text-xs text-muted-foreground">v1 rewrite</span>
            </div>

            <nav className="flex items-center gap-6 text-xs">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/#workflow"
                className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Workflow
              </a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/#features"
                className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Features
              </a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/#ai"
                className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                AI
              </a>
              <Link
                href="/roadmap"
                className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Roadmap
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Open App
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
        </div>
      </div>
    </footer>
  );
}
