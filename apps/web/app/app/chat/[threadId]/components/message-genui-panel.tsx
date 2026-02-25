"use client"

import type { Spec } from "@json-render/core"
import { ChatGenUIRenderer } from "@/lib/genui/chat-renderer"

interface MessageGenUIPanelProps {
  spec: Spec
}

export function MessageGenUIPanel({ spec }: MessageGenUIPanelProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 md:p-4">
      <ChatGenUIRenderer spec={spec} state={spec.state ?? {}} />
    </div>
  )
}
