/**
 * Optional hooks for product analytics (no-op until wired).
 */
export function trackWorkspaceRouteCycle(direction: "next" | "prev"): void {
  void direction
}

export function trackFloatingPanelOpen(
  side: "left" | "right",
  open: boolean,
): void {
  void side
  void open
}
