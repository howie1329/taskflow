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
      Type / to pick a tool for your next send · Ctrl+↵ to send
    </span>
  )
}
