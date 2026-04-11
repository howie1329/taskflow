export const SHORTCUT_KEYS = {
  goTo: "k",
  toggleSidebar: "b",
  toggleInspector: "i",
  createNew: "n",
  localSearch: "/",
} as const

export const SHORTCUT_DISPLAY = {
  goTo: "⌘K",
  toggleSidebar: "⌘B",
  toggleInspector: "⌘I",
  createNew: "⌘N",
  localSearch: "/",
  routeHopNext: "⌥⌘→",
  routeHopPrev: "⌥⌘←",
} as const

export const SHORTCUT_HINT = {
  goTo: "⌘K or Ctrl+K",
  toggleSidebar: "⌘B or Ctrl+B",
  toggleInspector: "⌘I or Ctrl+I",
  createNew: "⌘N or Ctrl+N",
  localSearch: "/",
  routeHop:
    "⌥⌘→ / ⌥⌘← (or Ctrl+Alt+→ / Ctrl+Alt+←)",
} as const
