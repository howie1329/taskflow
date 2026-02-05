"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConvexAuth } from "convex/react";

export function Hero() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <section id="main" className="relative w-full px-4 py-20 lg:px-6 lg:py-28">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-md font-mono text-xs">
                v1 Rewrite
              </Badge>
              <span className="text-xs text-muted-foreground">
                Convex-powered
              </span>
            </div>

            <h1 className="text-balance text-4xl font-medium lg:text-5xl xl:text-6xl">
              Your AI-assisted workplace
            </h1>

            <p className="max-w-[600px] text-pretty text-muted-foreground text-sm leading-relaxed lg:text-base">
              Solo productivity system: capture ideas, organize projects and
              tasks, manage notes, schedule your day, and get AI help without
              tab-hopping.
            </p>

            <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
              {isAuthenticated ? (
                <Link href="/app" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Open Taskflow
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute -inset-6 bg-muted/20" />
            <Card className="relative overflow-hidden border-border/60 bg-card/40 dark:bg-card/20">
              <CardHeader className="gap-4 border-b border-border/60 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-xs">
                    Taskflow workspace
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    <div className="h-2 w-2 rounded-full bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid min-h-[300px] grid-cols-3">
                  <div className="col-span-1 hidden border-r border-border/60 p-4 sm:block">
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
                  <div className="col-span-3 p-4 sm:col-span-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-2 w-24 rounded bg-muted" />
                        <Badge
                          variant="outline"
                          className="rounded-md text-[10px]"
                        >
                          AI chat
                        </Badge>
                      </div>
                      <div className="space-y-3">
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
