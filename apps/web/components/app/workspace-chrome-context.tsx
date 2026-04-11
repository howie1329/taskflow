"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ChatThreadChromeActions = {
  onEditTitle: () => void
  onDelete: () => void
  onCompactChat?: () => void | Promise<void>
}

type WorkspaceChromeContextValue = {
  pageTitleOverride: string | null
  setPageTitleOverride: (value: string | null) => void
  chatThreadActions: ChatThreadChromeActions | null
  setChatThreadActions: (value: ChatThreadChromeActions | null) => void
}

const WorkspaceChromeContext = createContext<WorkspaceChromeContextValue | null>(
  null,
)

export function WorkspaceChromeProvider({ children }: { children: ReactNode }) {
  const [pageTitleOverride, setPageTitleOverride] = useState<string | null>(null)
  const [chatThreadActions, setChatThreadActions] =
    useState<ChatThreadChromeActions | null>(null)

  const value = useMemo(
    () => ({
      pageTitleOverride,
      setPageTitleOverride,
      chatThreadActions,
      setChatThreadActions,
    }),
    [pageTitleOverride, chatThreadActions],
  )

  return (
    <WorkspaceChromeContext.Provider value={value}>
      {children}
    </WorkspaceChromeContext.Provider>
  )
}

export function useWorkspaceChrome() {
  const ctx = useContext(WorkspaceChromeContext)
  if (!ctx) {
    throw new Error("useWorkspaceChrome must be used within WorkspaceChromeProvider")
  }
  return ctx
}
