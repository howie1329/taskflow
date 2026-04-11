"use client"

import Link from "next/link"
import { useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon } from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/**
 * App Router `error.tsx` boundary — must be a Client Component.
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function AppRouteError({
  error,
  reset,
  homeHref = "/app/tasks",
  homeLabel = "Back to app",
}: {
  error: Error & { digest?: string }
  reset: () => void
  /** Root layout uses `/`; authenticated app uses `/app/tasks`. */
  homeHref?: string
  homeLabel?: string
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-4">
      <Empty className="max-w-md border-border/60 bg-card/30">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="size-4 text-destructive"
              strokeWidth={2}
            />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            This page hit an unexpected error. You can try again or return to
            the app home.
          </EmptyDescription>
        </EmptyHeader>
        <Alert variant="destructive" className="text-left">
          <AlertTitle className="text-xs">Error</AlertTitle>
          <AlertDescription className="font-mono text-[11px] break-all">
            {error.message || "Unknown error"}
            {error.digest ? ` (digest: ${error.digest})` : ""}
          </AlertDescription>
        </Alert>
        <div className="flex w-full flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        </div>
      </Empty>
    </div>
  )
}
