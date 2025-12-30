# AI Chat History & Context Management Analysis

## Current Implementation Overview

### Architecture
- **Backend**: Node.js with Vercel AI SDK, BullMQ for async jobs
- **Frontend**: React with `@ai-sdk/react` hook
- **Database**: PostgreSQL with Drizzle ORM
- **Token Estimation**: `gpt-tokenizer` package
- **Context Management**: Custom `@taskflow/rag` package

### Current Flow

1. **Message Sending** (`controllers/conversations.js:sendMessage`)
   - Fetches full conversation history from DB
   - Slices to last 6 messages using `MessageContextSlicer`
   - Converts to model messages and prunes
   - Estimates tokens (limit: 2000)
   - If over limit, queues summarization job
   - Formats summaries and sends to AI

2. **Summarization** (`services/bullmq/jobs.js`)
   - Async job processes messages since last summary
   - Creates summary with tags, intent, token counts
   - Stores in `message_history_summary` table

3. **Tool Calls**
   - Stored as message parts
   - Pruned with `toolCalls: "before-last-message"`
   - Artifacts collected separately in frontend

---

## Issues & Limitations

### 🔴 Critical Issues

1. **Race Conditions**
   - Summarization is async, but context is built synchronously
   - Risk of using stale summaries or missing recent summaries
   - No coordination between summarization completion and next request

2. **Inefficient Context Slicing**
   ```typescript
   // Current logic in MessageContextSlicer
   if (messageSummaries.length > 0 && messageSummaries[messageSummaries.length - 1].messageIndex > 6) {
     const lastSummary = messageSummaries[messageSummaries.length - 1];
     return currentMessages.slice(lastSummary.messageIndex - sliceIndex);
   }
   ```
   - Hard-coded slice index (6)
   - Doesn't account for token limits dynamically
   - May include too many or too few messages

3. **Tool Call Loss Risk**
   - Tool calls pruned with `"before-last-message"`
   - If summarization happens, tool calls might be lost
   - No explicit handling of tool call importance

4. **Hard-coded Limits**
   - `CONTEXT_WINDOW_SIZE = 6` (fixed)
   - Token limit `2000` (hard-coded in multiple places)
   - Should be model-specific and configurable

### 🟡 Performance Issues

5. **No Token Caching**
   - Token estimation runs on every request
   - Messages already have `tokens` field but it's not used for estimation
   - Could cache token counts per message

6. **Inefficient Database Queries**
   - Fetches full conversation history every time
   - No pagination or incremental loading
   - Could use cursor-based pagination

7. **Redundant Conversions**
   - Messages converted multiple times (`convertToModelMessages`)
   - Pruned multiple times in different places
   - Could cache converted/pruned versions

### 🟢 Design Issues

8. **No Message Importance Scoring**
   - All messages treated equally
   - Should prioritize messages with tool calls, user questions, etc.
   - Could use semantic similarity or manual flags

9. **Summary Quality**
   - Summaries don't preserve tool call information
   - No way to reference specific tool calls from summaries
   - Could include tool call metadata in summaries

10. **No Incremental Summarization**
    - Summarizes entire batch at once
    - Could summarize incrementally as conversation grows
    - Would reduce latency and improve context freshness

11. **Limited Context Window Management**
    - Fixed window size doesn't adapt to conversation complexity
    - Should dynamically adjust based on:
      - Model's actual context window
      - Token density of messages
      - Importance of recent messages

---

## Recommended Improvements

### 1. **Unified Context Manager Service**

Create a dedicated service that handles all context management logic:

```typescript
// services/chat/ContextManagerService.js
export class ContextManagerService {
  constructor(config) {
    this.config = {
      recentMessageWindow: config.recentMessageWindow || 6,
      tokenLimit: config.tokenLimit || 2000,
      systemPromptTokens: config.systemPromptTokens || 500,
      modelContextWindow: config.modelContextWindow || 8000,
    };
  }

  async buildContext({
    conversationId,
    userId,
    systemPrompt,
    model,
  }) {
    // 1. Fetch messages and summaries atomically
    const [messages, summaries] = await Promise.all([
      conversationService.getConversationHistory(userId, conversationId),
      messageHistorySummaryOps.findByConversationId(conversationId, userId),
    ]);

    // 2. Calculate available token budget
    const systemTokens = estimateTokens(systemPrompt).tokenCount;
    const availableTokens = this.config.modelContextWindow - systemTokens - 500; // safety margin

    // 3. Build context intelligently
    const context = await this.selectMessages({
      messages,
      summaries,
      availableTokens,
    });

    // 4. Check if summarization needed
    await this.checkAndQueueSummarization({
      messages,
      summaries,
      conversationId,
      userId,
    });

    return context;
  }

  async selectMessages({ messages, summaries, availableTokens }) {
    // Start with recent messages
    const recentMessages = this.getRecentMessages(messages, summaries);
    
    // Estimate tokens
    const converted = convertToModelMessages(recentMessages);
    const pruned = pruneMessages({
      messages: converted,
      reasoning: "before-last-message",
      toolCalls: "all", // Keep all tool calls
      emptyMessages: "remove",
    });

    let { totalTokens } = estimateTokensFromPrunedMessages(pruned);
    
    // If under budget, try to include more context from summaries
    if (totalTokens < availableTokens * 0.7) {
      // Include relevant summaries
      const summaryContext = this.formatSummaries(summaries);
      const summaryTokens = estimateTokens(summaryContext).tokenCount;
      
      if (totalTokens + summaryTokens <= availableTokens) {
        return {
          recentMessages: pruned,
          summary: summaryContext,
          totalTokens: totalTokens + summaryTokens,
        };
      }
    }

    return {
      recentMessages: pruned,
      summary: this.formatSummaries(summaries),
      totalTokens,
    };
  }

  getRecentMessages(messages, summaries) {
    if (summaries.length === 0) {
      return messages.slice(-this.config.recentMessageWindow);
    }

    const lastSummary = summaries[summaries.length - 1];
    const startIndex = Math.max(
      0,
      lastSummary.messageIndex - this.config.recentMessageWindow
    );
    
    return messages.slice(startIndex);
  }

  async checkAndQueueSummarization({ messages, summaries, conversationId, userId }) {
    const lastSummaryIndex = summaries.length > 0
      ? summaries[summaries.length - 1].messageIndex
      : 0;

    const messagesSinceSummary = messages.slice(lastSummaryIndex);
    
    // Use cached token counts if available
    const totalTokens = messagesSinceSummary.reduce(
      (sum, msg) => sum + (msg.tokens || 0),
      0
    );

    // Only summarize if significant new content
    if (messagesSinceSummary.length >= 10 || totalTokens > 1500) {
      await addMessageSummarizationJob({
        conversationHistory: messagesSinceSummary,
        userId,
        conversationId,
        lastSummaryIndex,
      });
    }
  }
}
```

### 2. **Improved Message Selection Strategy**

```typescript
// Prioritize messages by importance
function prioritizeMessages(messages) {
  return messages.map((msg, index) => ({
    ...msg,
    priority: calculatePriority(msg, index, messages.length),
  })).sort((a, b) => b.priority - a.priority);
}

function calculatePriority(message, index, totalLength) {
  let priority = 0;
  
  // Recency boost (exponential decay)
  priority += Math.exp(-(totalLength - index) / 5);
  
  // Tool call boost
  if (hasToolCalls(message)) {
    priority += 2;
  }
  
  // User message boost
  if (message.role === 'user') {
    priority += 1;
  }
  
  // Long messages might be important
  if (message.tokens > 100) {
    priority += 0.5;
  }
  
  return priority;
}
```

### 3. **Tool Call Preservation**

```typescript
// Enhanced summarization that preserves tool call metadata
async function summarizeWithToolCalls(messages) {
  const summary = await aiChatService.newSummarization(messages);
  
  // Extract tool call information
  const toolCalls = extractToolCalls(messages);
  
  return {
    ...summary,
    toolCalls: toolCalls.map(tc => ({
      toolName: tc.name,
      timestamp: tc.timestamp,
      summary: tc.summary, // Brief description
    })),
  };
}
```

### 4. **Incremental Summarization**

```typescript
// Summarize in smaller chunks more frequently
async function incrementalSummarization(messages, summaries) {
  const CHUNK_SIZE = 5; // Summarize every 5 messages
  const lastSummaryIndex = summaries.length > 0
    ? summaries[summaries.length - 1].messageIndex
    : 0;
  
  const newMessages = messages.slice(lastSummaryIndex);
  
  // Process in chunks
  for (let i = 0; i < newMessages.length; i += CHUNK_SIZE) {
    const chunk = newMessages.slice(i, i + CHUNK_SIZE);
    if (chunk.length >= CHUNK_SIZE) {
      await summarizeChunk(chunk, lastSummaryIndex + i);
    }
  }
}
```

### 5. **Token Caching Strategy**

```typescript
// Use cached tokens when available
function estimateTokensWithCache(messages) {
  return messages.reduce((total, msg) => {
    if (msg.tokens) {
      return total + msg.tokens;
    }
    // Calculate and cache if missing
    const tokens = estimateTokens(msg.content).tokenCount;
    messageOps.updateTokens(msg.id, tokens);
    return total + tokens;
  }, 0);
}
```

### 6. **Model-Aware Context Windows**

```typescript
const MODEL_CONTEXT_WINDOWS = {
  'openai/gpt-4o-mini': 128000,
  'openai/gpt-4o': 128000,
  'openai/gpt-3.5-turbo': 16385,
  // ... etc
};

function getModelContextWindow(model) {
  return MODEL_CONTEXT_WINDOWS[model] || 8000;
}
```

### 7. **Race Condition Prevention**

```typescript
// Use database transactions or locks
async function buildContextWithLock(conversationId, userId) {
  // Option 1: Use database advisory locks
  await db.execute(sql`SELECT pg_advisory_lock(${conversationId})`);
  
  try {
    const context = await buildContext(...);
    return context;
  } finally {
    await db.execute(sql`SELECT pg_advisory_unlock(${conversationId})`);
  }
  
  // Option 2: Use Redis locks
  const lock = await redis.lock(`context:${conversationId}`, 5000);
  try {
    const context = await buildContext(...);
    return context;
  } finally {
    await lock.unlock();
  }
}
```

### 8. **Better Summary Formatting**

```typescript
// Include more structured information in summaries
function formatSummarizedMessageHistory(summaries) {
  return summaries.map((summary, index) => {
    const toolCallsInfo = summary.toolCalls?.length > 0
      ? `\nTool Calls: ${summary.toolCalls.map(tc => tc.toolName).join(', ')}`
      : '';
    
    return `[Summary ${index + 1}]
Conversation ID: ${summary.conversationId}
Summary: ${summary.summary}
Tags: ${summary.tags.join(', ')}
Intent: ${summary.intent}
Messages: ${summary.messageCount}${toolCallsInfo}`;
  }).join('\n\n');
}
```

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. ✅ Fix race conditions with locks/transactions
2. ✅ Improve MessageContextSlicer logic
3. ✅ Use cached token counts
4. ✅ Make limits configurable

### Phase 2: Performance (Week 2)
5. ✅ Create unified ContextManagerService
6. ✅ Implement token caching
7. ✅ Optimize database queries

### Phase 3: Enhanced Features (Week 3-4)
8. ✅ Message prioritization
9. ✅ Tool call preservation in summaries
10. ✅ Incremental summarization
11. ✅ Model-aware context windows

---

## Migration Strategy

1. **Create new ContextManagerService** alongside existing code
2. **Gradually migrate** endpoints to use new service
3. **Add feature flags** to toggle between old/new implementations
4. **Monitor** token usage, latency, and context quality
5. **Deprecate** old code once new implementation is stable

---

## Testing Recommendations

1. **Unit Tests**
   - Context selection logic
   - Token estimation accuracy
   - Message prioritization

2. **Integration Tests**
   - End-to-end message flow
   - Summarization job processing
   - Race condition scenarios

3. **Load Tests**
   - Long conversations (100+ messages)
   - High concurrent requests
   - Large tool call chains

---

## Metrics to Track

- Average tokens per request
- Summarization job latency
- Context window utilization %
- Tool call preservation rate
- Race condition occurrences
- Cache hit rate for token counts
