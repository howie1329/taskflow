"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useParams, usePathname } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import type { ChatStatus, FileUIPart, UIMessage } from "ai"
import { nanoid } from "nanoid"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { useViewer } from "@/components/settings/hooks/use-viewer"
import type { ModeName } from "@/lib/AITools/ModePrompts"
import {
  getToolLockCommandsForMode,
  type ToolKey,
} from "@/lib/AITools/tool-lock-commands"

type PersistedUsage = {
  inputTokens: number
  outputTokens: number
  totalTokens?: number
}

type ChatMessageMetadata = {
  usage?: PersistedUsage
  costUsdMicros?: number
}

type PersistedMessageFields = {
  usage?: PersistedUsage
  costUsdMicros?: number
}

type ChatSendPromptInput = {
  text: string
  files: FileUIPart[]
}

type ChatRequestState = {
  selectedModelId: string | null
  selectedInterface: string | null
  selectedProjectId: string | null
  selectedMode: ModeName
  toolLock: ToolKey | null
  userId: string | null | undefined
}

type ChatIdState = {
  activeThreadId: string
  isThreadRoute: boolean
}

type ChatMessagesState = {
  messages: UIMessage[]
  status: ChatStatus
  error: Error | undefined
}

type ChatMessagingActions = {
  sendPrompt: (message: ChatSendPromptInput) => Promise<void>
  sendText: (text: string) => Promise<void>
  stop: () => void
}

type ChatConfigState = {
  selectedModelId: string | null
  selectedInterface: string | null
  selectedProjectId: string | null
  selectedMode: ModeName
  toolLock: ToolKey | null
  availableModels: Doc<"availableModels">[]
  projects: Doc<"projects">[]
  thread: Doc<"thread"> | null | undefined
  project: Doc<"projects"> | null | undefined
}

type ChatConfigActions = {
  setSelectedModel: (model: Doc<"availableModels"> | null) => void
  setSelectedProjectId: (value: string | null) => void
  setSelectedMode: (value: ModeName) => void
  setToolLock: (value: ToolKey | null) => void
}

type SetThreadScopeInput =
  | { scope: "workspace" }
  | { scope: "project"; projectId: Id<"projects"> }

type ChatThreadActions = {
  updateTitle: (title: string) => Promise<void>
  softDelete: () => Promise<void>
  setScope: (input: SetThreadScopeInput) => Promise<void>
}

type ChatThreadDataState = {
  threadMessages:
    | Array<{
      role?: string
      usage?: {
        inputTokens?: number
      }
    }>
    | undefined
}

const ChatIdContext = createContext<ChatIdState | null>(null)
const ChatMessagesContext = createContext<ChatMessagesState | null>(null)
const ChatMessagingActionsContext = createContext<ChatMessagingActions | null>(null)
const ChatConfigContext = createContext<ChatConfigState | null>(null)
const ChatConfigActionsContext = createContext<ChatConfigActions | null>(null)
const ChatThreadActionsContext = createContext<ChatThreadActions | null>(null)
const ChatThreadDataContext = createContext<ChatThreadDataState | null>(null)

const createDraftThreadId = () => `thread_${nanoid(10)}`

function getDefaultModelId({
  threadModel,
  preferredModelId,
  availableModels,
}: {
  threadModel: string | null | undefined
  preferredModelId: string | null | undefined
  availableModels: Doc<"availableModels">[]
}) {
  return threadModel ?? preferredModelId ?? availableModels[0]?.modelId ?? null
}

function getDefaultInterfaceId({
  threadInterface,
  modelId,
  availableModels,
}: {
  threadInterface: string | null | undefined
  modelId: string | null
  availableModels: Doc<"availableModels">[]
}) {
  if (threadInterface) return threadInterface
  if (!modelId) return null
  const model = availableModels.find((m) => m.modelId === modelId)
  return model?.interface ?? null
}

function getEffectiveToolLock(selectedMode: ModeName, toolLock: ToolKey | null) {
  if (!toolLock) return null

  const availableInMode = new Set(
    getToolLockCommandsForMode(selectedMode)
      .map((commandDef) => commandDef.toolKey)
      .filter((toolKey): toolKey is ToolKey => toolKey !== null),
  )

  return availableInMode.has(toolLock) ? toolLock : null
}

function toServerMessages(
  threadMessages:
    | Array<{
      messageId: string
      role: UIMessage["role"]
      content: UIMessage["parts"]
    } & PersistedMessageFields>
    | undefined,
): UIMessage<ChatMessageMetadata>[] {
  if (!threadMessages) return []

  return threadMessages.map((message) => ({
    id: message.messageId,
    role: message.role,
    parts: message.content,
    metadata: {
      usage: (message as unknown as PersistedMessageFields).usage,
      costUsdMicros: (message as unknown as PersistedMessageFields).costUsdMicros,
    },
  }))
}

function useRequiredContext<T>(
  context: React.Context<T | null>,
  name: string,
): T {
  const value = useContext(context)
  if (!value) {
    throw new Error(`${name} must be used within ChatProvider`)
  }
  return value
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const isThreadRoute =
    typeof params.threadId === "string" && pathname.startsWith("/app/chat/")

  const [draftThreadId, setDraftThreadId] = useState(createDraftThreadId)
  const previousIsThreadRoute = useRef(isThreadRoute)

  useEffect(() => {
    if (previousIsThreadRoute.current && !isThreadRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftThreadId(createDraftThreadId())
    }
    previousIsThreadRoute.current = isThreadRoute
  }, [isThreadRoute])

  const activeThreadId = isThreadRoute
    ? (params.threadId as string)
    : draftThreadId

  const { messages, setMessages, sendMessage, status, error, stop } = useChat({
    id: activeThreadId,
    experimental_throttle: 100
  })
  const { userId } = useViewer()

  const thread = useQuery(api.chat.getThread, { threadId: activeThreadId })
  const project = useQuery(
    api.projects.getMyProject,
    thread?.projectId ? { projectId: thread.projectId } : "skip",
  )
  const projects = useQuery(api.projects.listMyProjects, { status: "active" })
  const threadMessages = useQuery(api.chat.listMessages, {
    threadId: activeThreadId,
  })
  const bootstrap = useQuery(api.chat.getChatBootstrap)

  const availableModels = useMemo(
    () => bootstrap?.availableModels ?? [],
    [bootstrap?.availableModels],
  )

  const defaultModelId = useMemo(() => {
    return getDefaultModelId({
      threadModel: thread?.model,
      preferredModelId: bootstrap?.preferences?.defaultAIModel?.modelId,
      availableModels,
    })
  }, [
    thread?.model,
    bootstrap?.preferences?.defaultAIModel?.modelId,
    availableModels,
  ])

  const defaultInterface = useMemo(() => {
    return getDefaultInterfaceId({
      threadInterface: thread?.interface ?? null,
      modelId: defaultModelId ?? thread?.model ?? null,
      availableModels,
    })
  }, [thread?.interface, thread?.model, defaultModelId, availableModels])

  const [selectedModelId, setSelectedModelIdState] = useState<string | null>(null)
  const [selectedInterface, setSelectedInterfaceState] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<ModeName>("Basic")
  const [toolLock, setToolLock] = useState<ToolKey | null>(null)
  const hasUserSelectedModel = useRef(false)
  const previousThreadId = useRef(activeThreadId)

  useEffect(() => {
    if (previousThreadId.current !== activeThreadId) {
      hasUserSelectedModel.current = false
      previousThreadId.current = activeThreadId
    }
  }, [activeThreadId])

  const effectiveToolLock = useMemo(() => {
    return getEffectiveToolLock(selectedMode, toolLock)
  }, [selectedMode, toolLock])

  useEffect(() => {
    if (!hasUserSelectedModel.current) {
      if (thread?.model) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedModelIdState(thread.model)
        setSelectedInterfaceState(
          thread.interface ??
          availableModels.find((m) => m.modelId === thread.model)?.interface ??
          null,
        )
      } else if (defaultModelId) {
        setSelectedModelIdState(defaultModelId)
        setSelectedInterfaceState(defaultInterface)
      }
    }
  }, [
    thread?.model,
    thread?.interface,
    defaultModelId,
    defaultInterface,
    availableModels,
  ])

  const setSelectedModel = useCallback(
    (model: Doc<"availableModels"> | null) => {
      hasUserSelectedModel.current = true
      setSelectedModelIdState(model?.modelId ?? null)
      setSelectedInterfaceState(model?.interface ?? null)
    },
    [],
  )

  const serverMessages = useMemo<UIMessage<ChatMessageMetadata>[]>(() => {
    return toServerMessages(threadMessages)
  }, [threadMessages])

  useEffect(() => {
    if (status !== "ready") return
    if (messages.length > 0) return
    if (serverMessages.length === 0) return
    setMessages(serverMessages)
  }, [messages.length, serverMessages, setMessages, status])

  const requestStateRef = useRef<ChatRequestState>({
    selectedModelId,
    selectedInterface,
    selectedProjectId,
    selectedMode,
    toolLock: effectiveToolLock,
    userId,
  })

  useEffect(() => {
    requestStateRef.current = {
      selectedModelId,
      selectedInterface,
      selectedProjectId,
      selectedMode,
      toolLock: effectiveToolLock,
      userId,
    }
  }, [
    selectedModelId,
    selectedInterface,
    selectedProjectId,
    selectedMode,
    effectiveToolLock,
    userId,
  ])

  const sendPrompt = useCallback(
    async ({ text, files }: ChatSendPromptInput) => {
      const trimmed = text.trim()
      const hasFiles = files.length > 0
      const {
        selectedModelId: currentModel,
        selectedInterface: currentInterface,
        selectedProjectId: currentProjectId,
        selectedMode: currentMode,
        toolLock: currentToolLock,
        userId: currentUserId,
      } = requestStateRef.current
      if ((!trimmed && !hasFiles) || !currentModel || !currentUserId) return

      await sendMessage(
        { text: trimmed, files },
        {
          body: {
            model: currentModel,
            interface: currentInterface ?? undefined,
            userId: currentUserId,
            projectId: currentProjectId,
            mode: currentMode,
            toolLock: currentToolLock,
          },
        },
      )
    },
    [sendMessage],
  )

  const sendText = useCallback(
    async (text: string) => {
      await sendPrompt({ text, files: [] })
    },
    [sendPrompt],
  )

  const stopStreaming = useCallback(() => {
    stop()
  }, [stop])

  const updateThreadTitleMutation = useMutation(api.chat.updateThreadTitle)
  const softDeleteThreadMutation = useMutation(api.chat.softDeleteThread)
  const setThreadScopeMutation = useMutation(api.chat.setThreadScope)

  const updateTitle = useCallback(
    async (title: string) => {
      if (!thread || !title.trim()) return
      await updateThreadTitleMutation({
        threadId: thread.threadId,
        title: title.trim(),
      })
    },
    [thread, updateThreadTitleMutation],
  )

  const softDelete = useCallback(async () => {
    if (!thread) return
    await softDeleteThreadMutation({ threadId: thread.threadId })
  }, [thread, softDeleteThreadMutation])

  const setScope = useCallback(
    async (input: SetThreadScopeInput) => {
      if (!thread) return

      if (input.scope === "workspace") {
        await setThreadScopeMutation({
          threadId: thread.threadId,
          scope: "workspace",
        })
        return
      }

      await setThreadScopeMutation({
        threadId: thread.threadId,
        scope: "project",
        projectId: input.projectId,
      })
    },
    [thread, setThreadScopeMutation],
  )

  const idState = useMemo<ChatIdState>(
    () => ({ activeThreadId, isThreadRoute }),
    [activeThreadId, isThreadRoute],
  )

  const messagesState = useMemo<ChatMessagesState>(
    () => ({ messages, status, error }),
    [messages, status, error],
  )

  const messagingActions = useMemo<ChatMessagingActions>(
    () => ({ sendPrompt, sendText, stop: stopStreaming }),
    [sendPrompt, sendText, stopStreaming],
  )

  const configState = useMemo<ChatConfigState>(
    () => ({
      selectedModelId,
      selectedInterface,
      selectedProjectId,
      selectedMode,
      toolLock: effectiveToolLock,
      availableModels,
      projects: projects ?? [],
      thread,
      project,
    }),
    [
      selectedModelId,
      selectedInterface,
      selectedProjectId,
      selectedMode,
      effectiveToolLock,
      availableModels,
      projects,
      thread,
      project,
    ],
  )

  const configActions = useMemo<ChatConfigActions>(
    () => ({
      setSelectedModel,
      setSelectedProjectId,
      setSelectedMode,
      setToolLock,
    }),
    [setSelectedModel, setSelectedProjectId, setSelectedMode, setToolLock],
  )

  const threadActions = useMemo<ChatThreadActions>(
    () => ({ updateTitle, softDelete, setScope }),
    [updateTitle, softDelete, setScope],
  )

  const threadDataState = useMemo<ChatThreadDataState>(
    () => ({ threadMessages }),
    [threadMessages],
  )

  return (
    <ChatIdContext.Provider value={idState}>
      <ChatMessagesContext.Provider value={messagesState}>
        <ChatMessagingActionsContext.Provider value={messagingActions}>
          <ChatThreadDataContext.Provider value={threadDataState}>
            <ChatConfigContext.Provider value={configState}>
              <ChatConfigActionsContext.Provider value={configActions}>
                <ChatThreadActionsContext.Provider value={threadActions}>
                  {children}
                </ChatThreadActionsContext.Provider>
              </ChatConfigActionsContext.Provider>
            </ChatConfigContext.Provider>
          </ChatThreadDataContext.Provider>
        </ChatMessagingActionsContext.Provider>
      </ChatMessagesContext.Provider>
    </ChatIdContext.Provider>
  )
}

export function useChatId() {
  return useRequiredContext(ChatIdContext, "useChatId")
}

export function useChatMessages() {
  return useRequiredContext(ChatMessagesContext, "useChatMessages")
}

export function useChatMessagingActions() {
  return useRequiredContext(ChatMessagingActionsContext, "useChatMessagingActions")
}

export function useChatConfig() {
  return useRequiredContext(ChatConfigContext, "useChatConfig")
}

export function useChatConfigActions() {
  return useRequiredContext(ChatConfigActionsContext, "useChatConfigActions")
}

export function useChatThreadActions() {
  return useRequiredContext(ChatThreadActionsContext, "useChatThreadActions")
}

export function useChatThreadMessages() {
  const { threadMessages } = useRequiredContext(
    ChatThreadDataContext,
    "useChatThreadMessages",
  )
  return threadMessages
}
