/**
 * Parse composer text for inline slash-command picker state.
 */
export function parseSlashCommandInput(input: string): {
  menuOpen: boolean
  filterQuery: string
} {
  const trimmedStart = input.replace(/^\s*/, "")
  if (!trimmedStart.startsWith("/")) {
    return { menuOpen: false, filterQuery: "" }
  }
  return { menuOpen: true, filterQuery: trimmedStart.slice(1).toLowerCase() }
}
