"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConvexAuth } from "convex/react";

export function Hero() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <section className="container relative flex flex-col items-center justify-center gap-8 px-4 py-24 lg:px-6 lg:py-32">
      <div className="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-md font-mono text-xs">
            v1 Rewrite
          </Badge>
          <span className="text-xs text-muted-foreground">Convex-powered</span>
        </div>

        <h1 className="text-4xl font-medium tracking-tight lg:text-5xl xl:text-6xl">
          Your AI-assisted workplace
        </h1>

        <p className="max-w-[600px] text-muted-foreground text-sm lg:text-base leading-relaxed">
          Solo productivity system: capture ideas, organize projects and tasks,
          manage notes, schedule your day, and get AI help without tab-hopping.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-4">
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
                  Get started free
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="relative w-full max-w-4xl mx-auto mt-12">
        <div className="absolute -inset-4 bg-linear-to-r from-primary/5 via-secondary/5 to-primary/5 blur-2xl" />
        <Card className="relative overflow-hidden border-dashed">
          <CardHeader className="gap-4 border-b border-dashed pb-4">
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
            <div className="grid grid-cols-3 min-h-[280px]">
              <div className="col-span-1 border-r border-dashed p-4 hidden sm:block">
                <div className="space-y-3">
                  <div className="h-2 w-16 bg-muted rounded" />
                  <div className="space-y-2">
                    <div className="h-6 w-full bg-muted/50 rounded" />
                    <div className="h-6 w-full bg-muted/50 rounded" />
                    <div className="h-6 w-3/4 bg-primary/10 rounded" />
                    <div className="h-6 w-full bg-muted/50 rounded" />
                  </div>
                </div>
              </div>
              <div className="col-span-3 sm:col-span-2 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-24 bg-muted rounded" />
                    <Badge
                      variant="outline"
                      className="rounded-md text-[10px]"
                    >
                      AI chat
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded bg-muted shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-2 w-full bg-muted/50 rounded" />
                        <div className="h-2 w-5/6 bg-muted/50 rounded" />
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pl-8">
                      <div className="h-6 w-6 rounded bg-primary/10 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-2 w-4/5 bg-primary/5 rounded" />
                        <div className="h-2 w-3/4 bg-primary/5 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
