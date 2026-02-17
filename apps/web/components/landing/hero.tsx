"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConvexAuth } from "convex/react";

export function Hero() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <section id="main" className="relative w-full px-4 py-24 lg:px-6 lg:py-32">
      <div className="pointer-events-none absolute inset-0 landing-radial-wash" />
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="flex max-w-2xl flex-col items-center gap-8 text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-3 text-xs">
              <Badge
                variant="outline"
                className="rounded-full border-border/50 px-3 font-mono text-[11px]"
              >
                v1 Rewrite
              </Badge>
              <span className="text-muted-foreground">Convex-powered</span>
            </div>

            <div className="space-y-5">
              <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl xl:text-[3.4rem]">
                Your AI-assisted workplace, rebuilt for focused solo work
              </h1>
              <p className="max-w-[62ch] text-pretty text-base leading-7 text-muted-foreground">
                Capture ideas, organize projects and tasks, manage notes, plan
                your day, and let AI execute the busywork. Everything stays in
                one calm workspace.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row">
              {isAuthenticated ? (
                <Link href="/app" className="w-full sm:w-auto">
                  <Button size="lg" className="h-11 w-full px-6 sm:w-auto">
                    Open Taskflow
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="h-11 w-full px-6 sm:w-auto">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 w-full border-border/50 bg-transparent px-6 sm:w-auto"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Keep your workflow in one place. No tab-hopping.
            </p>
          </div>

          <div className="relative w-full">
            <div className="pointer-events-none absolute -inset-4 rounded-[1.35rem] border border-border/30" />
            <Card className="relative overflow-hidden rounded-2xl border-border/40 bg-card/70 shadow-sm dark:bg-card/40">
              <CardHeader className="gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Taskflow workspace
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/35" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/35" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/35" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid min-h-[320px] grid-cols-3">
                  <div className="col-span-1 hidden border-r border-border/40 p-4 sm:block">
                    <div className="space-y-3">
                      <div className="h-2 w-16 rounded bg-muted" />
                      <div className="space-y-2">
                        <div className="h-6 w-full rounded bg-muted/50" />
                        <div className="h-6 w-full rounded bg-muted/50" />
                        <div className="h-6 w-3/4 rounded bg-primary/10" />
                        <div className="h-6 w-full rounded bg-muted/50" />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 p-5 sm:col-span-2">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="h-2 w-24 rounded bg-muted" />
                        <Badge
                          variant="outline"
                          className="rounded-full border-border/50 px-2.5 text-[10px]"
                        >
                          AI operator
                        </Badge>
                      </div>
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 shrink-0 rounded bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-2 w-full rounded bg-muted/50" />
                            <div className="h-2 w-5/6 rounded bg-muted/50" />
                          </div>
                        </div>
                        <div className="flex items-start gap-3 pl-8">
                          <div className="h-6 w-6 shrink-0 rounded bg-primary/10" />
                          <div className="flex-1 space-y-2">
                            <div className="h-2 w-4/5 rounded bg-primary/5" />
                            <div className="h-2 w-3/4 rounded bg-primary/5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
