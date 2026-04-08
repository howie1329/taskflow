"use client"

export function ComposerHints({
  show,
  toolLock,
}: {
  show: boolean
  toolLock: unknown
}) {
  if (!show || !!toolLock) return null
  return (
    <span className="text-[11px] text-muted-foreground">
      Type / for commands · Ctrl+↵ to send
    </span>
  )
}
