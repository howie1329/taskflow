"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ChatInspectorFocus =
  | {
      type: "message"
      messageId: string
    }
  | {
      type: "tool"
      messageId: string
      toolCallId: string
    }
  | null

type ChatInspectorContextValue = {
  focus: ChatInspectorFocus
  setFocus: (focus: ChatInspectorFocus) => void
  clearFocus: () => void
}

const ChatInspectorContext = createContext<ChatInspectorContextValue | null>(null)

export function ChatInspectorProvider({ children }: { children: ReactNode }) {
  const [focus, setFocus] = useState<ChatInspectorFocus>(null)

  const clearFocus = useCallback(() => setFocus(null), [])

  const value = useMemo(
    () => ({
      focus,
      setFocus,
      clearFocus,
    }),
    [focus, clearFocus],
  )

  return (
    <ChatInspectorContext.Provider value={value}>
      {children}
    </ChatInspectorContext.Provider>
  )
}

function useRequiredChatInspectorContext() {
  const value = useContext(ChatInspectorContext)
  if (!value) {
    throw new Error("ChatInspectorContext must be used within ChatInspectorProvider")
  }

  return value
}

export function useChatInspectorFocus() {
  return useRequiredChatInspectorContext().focus
}

export function useChatInspectorFocusActions() {
  const { setFocus, clearFocus } = useRequiredChatInspectorContext()

  return {
    setInspectorFocus: setFocus,
    clearInspectorFocus: clearFocus,
  }
}
