"use client"

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react"

type ChatComposerContextValue = {
  registerFocus: (fn: (() => void) | undefined) => void
  focusComposer: () => void
}

const ChatComposerContext = createContext<ChatComposerContextValue | null>(null)

export function ChatComposerProvider({ children }: { children: ReactNode }) {
  const focusRef = useRef<(() => void) | undefined>(undefined)

  const registerFocus = useCallback((fn: (() => void) | undefined) => {
    focusRef.current = fn
  }, [])

  const focusComposer = useCallback(() => {
    focusRef.current?.()
  }, [])

  const value: ChatComposerContextValue = {
    registerFocus,
    focusComposer,
  }

  return (
    <ChatComposerContext.Provider value={value}>
      {children}
    </ChatComposerContext.Provider>
  )
}

export function useChatComposerFocus() {
  const ctx = useContext(ChatComposerContext)
  return ctx
}
