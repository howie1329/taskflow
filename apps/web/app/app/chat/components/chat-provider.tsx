"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useParams, usePathname } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import type { ChatStatus, UIMessage } from "ai"
import { nanoid } from "nanoid"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"

type ChatContextValue = {
  activeThreadId: string
  isThreadRoute: boolean
  messages: UIMessage[]
  status: ChatStatus
  error: Error | undefined
  sendText: (text: string) => Promise<void>
  stop: () => Promise<void>
  selectedModelId: string | null
  setSelectedModelId: (value: string | null) => void
  availableModels: Doc<"availableModels">[]
  thread: Doc<"thread"> | null | undefined
  project: Doc<"projects"> | null | undefined
}

const ChatContext = createContext<ChatContextValue | null>(null)

const createDraftThreadId = () => `thread_${nanoid(10)}`

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const isThreadRoute =
    typeof params.threadId === "string" && pathname.startsWith("/app/chat/")

  const [draftThreadId, setDraftThreadId] = useState(createDraftThreadId)
  const previousIsThreadRoute = useRef(isThreadRoute)

  useEffect(() => {
    if (previousIsThreadRoute.current && !isThreadRoute) {
      setDraftThreadId(createDraftThreadId())
    }
    previousIsThreadRoute.current = isThreadRoute
  }, [isThreadRoute])

  const activeThreadId = isThreadRoute
    ? (params.threadId as string)
    : draftThreadId

  const { messages, setMessages, sendMessage, status, error, stop } = useChat({
    id: activeThreadId,
  })

  const thread = useQuery(api.chat.getThread, { threadId: activeThreadId })
  const project = useQuery(
    api.projects.getMyProject,
    thread?.projectId ? { projectId: thread.projectId } : "skip"
  )
  const threadMessages = useQuery(api.chat.listMessages, {
    threadId: activeThreadId,
  })
  const bootstrap = useQuery(api.chat.getChatBootstrap)

  const availableModels = bootstrap?.availableModels ?? []

  const defaultModelId = useMemo(() => {
    return (
      thread?.model ??
      bootstrap?.preferences?.defaultAIModel?.modelId ??
      availableModels[0]?.modelId ??
      null
    )
  }, [
    thread?.model,
    bootstrap?.preferences?.defaultAIModel?.modelId,
    availableModels,
  ])

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

  useEffect(() => {
    if (thread?.model && thread.model !== selectedModelId) {
      setSelectedModelId(thread.model)
    }
  }, [thread?.model, selectedModelId])

  useEffect(() => {
    if (!selectedModelId && defaultModelId) {
      setSelectedModelId(defaultModelId)
    }
  }, [defaultModelId, selectedModelId])

  const serverMessages = useMemo<UIMessage[]>(() => {
    if (!threadMessages) return []
    return threadMessages.map((message) => ({
      id: message.messageId,
      role: message.role,
      parts: message.content,
    }))
  }, [threadMessages])

  useEffect(() => {
    if (status !== "ready") return
    if (messages.length > 0) return
    if (serverMessages.length === 0) return
    setMessages(serverMessages)
  }, [messages.length, serverMessages, setMessages, status])

  const sendText = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !selectedModelId) return
    await sendMessage(
      { text: trimmed },
      { body: { model: selectedModelId } }
    )
  }

  const value = useMemo<ChatContextValue>(
    () => ({
      activeThreadId,
      isThreadRoute,
      messages,
      status,
      error,
      sendText,
      stop,
      selectedModelId,
      setSelectedModelId,
      availableModels,
      thread,
      project,
    }),
    [
      activeThreadId,
      isThreadRoute,
      messages,
      status,
      error,
      sendText,
      stop,
      selectedModelId,
      availableModels,
      thread,
      project,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider")
  }
  return ctx
}
