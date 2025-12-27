export type TokenEstimate = {
    tokenCount: number
    tokens: unknown[]
    isWithinLimit:  number | boolean
}

export type EstimateTokensFromPrunedMessagesResult = {
    totalTokens: number
    isWithinLimit: boolean
}

export type SummarizeConversationResult = {
    estimatedTokens: number
    shouldSummarize: number | boolean
}

export type ChatMessageRole = "user" | "assistant" | "system" | "tool"

export type ChatMessage = {
    role: ChatMessageRole
    content: string
}

export type ChatMessageFromDB = {
    id: string
    conversationId: string
    userId: string
    role: ChatMessageRole
    content: string
    createdAt: string
    updatedAt: string
    tokens: number
    vectors: number[]
    metadata: Record<string, unknown>
}
export type MessageSummary = {
    id: string
    conversationId: string
    userId: string;
    summary: string
    tags: string[]
    intent: string
    messageCount: number
    messageStartTokens: number
    messageEndTokens: number
    messageIndex: number
    createdAt: string
    updatedAt: string
}

export type PrunedContent = | {
    type: "text"
    text: string
} | {
    type: "reasoning"
    text: string
} | {
    type: "tool-call"
    input: {
        query: string
    }
} | {
    type: "tool-result"
    output: {
        value: string
    }
}

export type PrunedMessage = {
    role: ChatMessageRole
    content: PrunedContent[]
}

export type TokenService = {
  estimateTokens: (content: string, tokenLimit?: number) => TokenEstimate;
  estimateTokensFromMessages: (messages: ChatMessage[], tokenLimit?: number) => TokenEstimate;
  estimateTokensFromPrunedMessages: (
    prunedMessages: PrunedMessage[],
    tokenLimit?: number
  ) => EstimateTokensFromPrunedMessagesResult;
};

export type GetMessagesToSummarizeResult = {
  messagesToSummarize: ChatMessageFromDB[];
  lastSummaryIndex: number;
};