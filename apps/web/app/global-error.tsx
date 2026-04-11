"use client"

import GlobalErrorFallback from "@/components/route-ui/global-error-fallback"

/**
 * Root-level error boundary — replaces the root layout when active.
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <GlobalErrorFallback error={error} reset={reset} />
}
