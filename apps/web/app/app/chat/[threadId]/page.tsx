"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, MessageQuestionIcon } from "@hugeicons/core-free-icons"
import type { UIMessage } from "ai"
import { api } from "@/convex/_generated/api"
import { useChatContext } from "../components/chat-provider"
import { useViewer } from "@/components/settings/hooks/use-viewer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { PromptInputProvider } from "@/components/ai-elements/prompt-input"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { MessageDetailsSheet } from "./components/message-details-sheet"
import { getMessageText } from "./components/message-parts"
import { ThreadComposerBar } from "./components/thread-composer-bar"
import { ThreadDialogs } from "./components/thread-dialogs"
import { ThreadHeader } from "./components/thread-header"
import { ThreadMessageList } from "./components/thread-message-list"

import "streamdown/styles.css"
import "katex/dist/katex.min.css"

function ThreadPageContent() {
  const router = useRouter()
  const { messages, status, sendText, error, thread, project } = useChatContext()
  const { preferences } = useViewer()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(thread?.title || "")
  const [messageDetailsId, setMessageDetailsId] = useState<string | null>(null)
  const [clearedErrorMessage, setClearedErrorMessage] = useState<string | null>(null)

  const updateThreadTitle = useMutation(api.chat.updateThreadTitle)
  const softDeleteThread = useMutation(api.chat.softDeleteThread)

  const uiMessages = useMemo(() => messages ?? [], [messages])
  const shouldShowNotFound =
    thread === null && messages.length === 0 && status === "ready"

  const handleEditTitle = async () => {
    if (!thread || !editTitle.trim()) return
    await updateThreadTitle({
      threadId: thread.threadId,
      title: editTitle.trim(),
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteThread = async () => {
    if (!thread) return
    await softDeleteThread({ threadId: thread.threadId })
    setIsDeleteDialogOpen(false)
    router.push("/app/chat")
  }

  const regenerateAssistantResponse = async (assistantMessageId: string) => {
    const assistantIndex = uiMessages.findIndex((message) => message.id === assistantMessageId)
    if (assistantIndex < 0) return

    const previousUser = [...uiMessages.slice(0, assistantIndex)]
      .reverse()
      .find((message) => message.role === "user")

    if (!previousUser) return

    const previousText = getMessageText(previousUser)
    if (!previousText.trim()) return

    await sendText(previousText)
  }

  const copyAssistantMessage = async (messageText: string) => {
    try {
      await navigator.clipboard.writeText(messageText)
    } catch (copyError) {
      console.error("Failed to copy assistant message", copyError)
    }
  }

  const selectedMessage = uiMessages.find((message) => message.id === messageDetailsId)
  const selectedMessageText = selectedMessage ? getMessageText(selectedMessage) : ""

  if (shouldShowNotFound) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b p-4 md:hidden">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/app/chat")}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
          </Button>
          <span className="text-sm font-medium">Back to chats</span>
        </div>

        <div className="flex flex-1 items-center justify-center p-8">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={MessageQuestionIcon} className="size-8" strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Conversation not found</EmptyTitle>
              <EmptyDescription>
                This conversation may have been deleted or the link is invalid.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => router.push("/app/chat")}>
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="mr-2 size-4"
                strokeWidth={2}
              />
              Start new chat
            </Button>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-1rem)] w-full flex-col overflow-hidden">
      <ThreadHeader
        thread={thread}
        project={project}
        onBackToChats={() => router.push("/app/chat")}
        onOpenEditTitle={() => {
          setEditTitle(thread?.title || "")
          setIsEditDialogOpen(true)
        }}
        onOpenDeleteThread={() => setIsDeleteDialogOpen(true)}
      />

      {error && error.message !== clearedErrorMessage && (
        <div className="px-4 py-3">
          <Alert variant="destructive" className="flex items-start justify-between gap-3">
            <div>
              <AlertTitle>Chat request failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearedErrorMessage(error.message)}
            >
              Clear error
            </Button>
          </Alert>
        </div>
      )}

      <ThreadDialogs
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        onSaveTitle={() => void handleEditTitle()}
        onDeleteThread={() => void handleDeleteThread()}
      />

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-6">
          {uiMessages.length === 0 ? (
            <ConversationEmptyState
              title="Start a new conversation"
              description="Ask anything, or use a prompt suggestion"
            />
          ) : (
            <ThreadMessageList
              uiMessages={uiMessages as UIMessage[]}
              status={status}
              preferences={preferences}
              onRegenerate={(assistantMessageId) =>
                void regenerateAssistantResponse(assistantMessageId)
              }
              onCopy={(messageText) => void copyAssistantMessage(messageText)}
              onOpenDetails={setMessageDetailsId}
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <MessageDetailsSheet
        open={!!messageDetailsId}
        onOpenChange={(open) => !open && setMessageDetailsId(null)}
        messageText={selectedMessageText}
      />

      <ThreadComposerBar thread={thread} />
    </div>
  )
}

export default function ThreadPage() {
  return (
    <PromptInputProvider>
      <ThreadPageContent />
    </PromptInputProvider>
  )
}
