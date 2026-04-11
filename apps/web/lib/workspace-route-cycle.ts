import { WORKSPACE_ROUTE_CYCLE_HREFS } from "@/lib/workspace-nav"

/**
 * Map any /app/* path to the hop segment base (e.g. /app/chat/thread -> /app/chat).
 */
export function normalizeWorkspaceHopPath(pathname: string): string | null {
  if (!pathname.startsWith("/app")) return null
  for (const href of WORKSPACE_ROUTE_CYCLE_HREFS) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return href
    }
  }
  return null
}

export function nextWorkspaceHopHref(pathname: string): string | null {
  const current = normalizeWorkspaceHopPath(pathname)
  if (!current) return null
  const i = WORKSPACE_ROUTE_CYCLE_HREFS.indexOf(current)
  if (i < 0) return null
  const next = (i + 1) % WORKSPACE_ROUTE_CYCLE_HREFS.length
  return WORKSPACE_ROUTE_CYCLE_HREFS[next] ?? null
}

export function prevWorkspaceHopHref(pathname: string): string | null {
  const current = normalizeWorkspaceHopPath(pathname)
  if (!current) return null
  const i = WORKSPACE_ROUTE_CYCLE_HREFS.indexOf(current)
  if (i < 0) return null
  const prev =
    (i - 1 + WORKSPACE_ROUTE_CYCLE_HREFS.length) %
    WORKSPACE_ROUTE_CYCLE_HREFS.length
  return WORKSPACE_ROUTE_CYCLE_HREFS[prev] ?? null
}
