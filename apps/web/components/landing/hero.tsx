"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConvexAuth } from "convex/react";

export function Hero() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <section id="main" className="relative w-full px-4 py-16 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-0 landing-radial-wash" />
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12">
          <div className="flex max-w-2xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-3 text-xs font-medium">
              <Badge
                variant="outline"
                className="rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em]"
              >
                v1
              </Badge>
              <span className="text-muted-foreground">Convex-powered</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.375rem] lg:leading-[1.15]">
                Your AI-assisted workplace, rebuilt for focused solo work
              </h1>
              <p className="max-w-[62ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                Capture ideas, organize projects and tasks, manage notes, plan
                your day, and let AI execute the busywork. Everything stays in
                one calm workspace.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 pt-1 sm:w-auto sm:flex-row sm:gap-3">
              {isAuthenticated ? (
                <Link href="/app" className="w-full sm:w-auto">
                  <Button
                    className="marketing-press w-full px-5 sm:w-auto"
                  >
                    Open Taskflow
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button className="marketing-press w-full px-5 sm:w-auto">
                      Get started
                    </Button>
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="marketing-press w-full border-border/50 bg-transparent px-5 sm:w-auto"
                    >
                      Sign in
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
            <div className="pointer-events-none absolute -inset-3 rounded-xl border border-border/35" />
            <Card className="relative overflow-hidden rounded-xl border border-border/40 bg-card/70 dark:bg-card/40">
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
