"use client"

import "./global-error.css"

/**
 * Root `global-error.tsx` UI — rendered outside the root layout, so it cannot
 * use `ThemeProvider` or most app providers. Styles: `global-error.css` (mirrors
 * critical tokens from `globals.css` for light/dark via `prefers-color-scheme`).
 */
export default function GlobalErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="global-error-body">
        <div className="global-error-root">
          <h1 className="global-error-title">Something went wrong</h1>
          <p className="global-error-desc">
            Taskflow hit a critical error. You can try reloading this page.
          </p>
          {error.message ? (
            <pre className="global-error-pre">{error.message}</pre>
          ) : null}
          <button type="button" className="global-error-button" onClick={reset}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
