<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Route loading and errors (Next.js App Router)

References: [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming), [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling).

- **`loading.tsx`**: Wraps the **page** segment in Suspense (not the sibling `layout.tsx`). Instant fallback while the segment loads or streams.
- **`error.tsx`**: Must be a **Client Component** (`"use client"`). Receives `error` and `reset()`. Does **not** catch errors thrown in the **same** segment’s `layout.tsx` — use a parent segment’s `error.tsx` for those.
- **`global-error.tsx`**: Replaces the **root** `layout` when active; must include `<html>` and `<body>`. Our root fallback uses `components/route-ui/global-error.css` so it renders without `ThemeProvider`.

Shared UI lives in `components/route-ui/`: `WorkspaceLoading`, `MarketingLoading`, `InspectorPanelLoading`, `AppRouteError`, `GlobalErrorFallback`.

Route files: `app/loading.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/(auth)/loading.tsx`, `app/app/loading.tsx`, `app/app/error.tsx`, optional deeper `loading.tsx` under dynamic segments and `app/app/@right/loading.tsx` for the inspector parallel route.
