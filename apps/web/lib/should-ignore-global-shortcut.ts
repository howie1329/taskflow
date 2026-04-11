/**
 * True when a workspace-wide shortcut should not run (typing in a field, etc.).
 * Keep in sync with SidebarProvider shortcut guards.
 */
export function shouldIgnoreGlobalShortcut(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return !!target.closest(
    'input, textarea, select, [contenteditable="true"]',
  )
}
