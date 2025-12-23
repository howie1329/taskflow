# @taskflow/rag Package Specification

A comprehensive guide for the `@taskflow/rag` package - a pure utility library for token estimation, context window management, and RAG policy decisions in LLM-based applications.

---

## Overview

`@taskflow/rag` is a **pure, framework-agnostic utility package** that provides token counting, budgeting, context window planning, and summarization decision logic. It contains **zero dependencies on databases, HTTP frameworks, or LLM providers**, making it highly testable and reusable across different applications.

### Core Principles

1. **Pure Functions**: All functions are deterministic and side-effect-free
2. **No IO**: No database, HTTP, or external service calls
3. **Framework Agnostic**: Works with any backend framework or application
4. **Type-Safe**: Full TypeScript support with comprehensive type definitions
5. **Testable**: Easy to unit test without mocking external dependencies

---

## Current Implementation Status

### ✅ Implemented

- **Token Estimation**
  - `estimateTokens(content, tokenLimit?)` - Estimate tokens for plain text
  - `estimateTokensFromMessages(messages, tokenLimit?)` - Estimate tokens for chat messages
  - `estimateTokensFromPrunedMessages(prunedMessages, tokenLimit?)` - Estimate tokens for pruned messages
  - `summarizeConversation(messages, tokenLimit?)` - Basic summarization decision

- **Token Service**
  - `tokenService` - Convenience object with all token estimation functions

- **Type Definitions**
  - `TokenEstimate`
  - `EstimateTokensFromPrunedMessagesResult`
  - `SummarizeConversationResult`
  - `ChatMessage`
  - `PrunedMessage`
  - `PrunedContent`

### 🚧 Planned / To Be Implemented

- Token budgeting and planning utilities
- Enhanced context window selection
- Model registry with token limits
- Context formatting utilities
- Enhanced summarization policy with model-specific thresholds
- Debug helpers and developer ergonomics

---

## What Should Be Included

### 1. Tokenization ✅ (Implemented)

**Purpose**: Accurate token counting for various content types.

**Functions**:
- `estimateTokens(text, tokenLimit?)` ✅
- `estimateTokensFromMessages(messages, tokenLimit?)` ✅
- `estimateTokensFromPrunedMessages(prunedMessages, tokenLimit?)` ✅

**Model Token Limit Registry** ⭐ (To Add):
```typescript
const MODEL_LIMITS = {
  'gpt-4o': { 
    contextWindow: 128000, 
    recommendedInput: 100000,
    maxSafeInput: 120000 
  },
  'gpt-4o-mini': { 
    contextWindow: 128000, 
    recommendedInput: 100000,
    maxSafeInput: 120000 
  },
  'gpt-3.5-turbo': { 
    contextWindow: 16000, 
    recommendedInput: 12000,
    maxSafeInput: 14000 
  },
  'claude-3-opus': { 
    contextWindow: 200000, 
    recommendedInput: 150000,
    maxSafeInput: 180000 
  },
  // ... more models
};
```

**Optional Cost Helpers** ⭐ (To Add):
- `calculateCost(tokens, model)` - Calculate cost based on token count and model pricing
- `estimateCostForMessages(messages, model)` - Estimate cost for message arrays

---

### 2. Token Budgeting & Planning ⭐ (To Add)

**Purpose**: Plan and manage token budgets for LLM requests.

**Functions**:

```typescript
// Create a token budget plan
createTokenBudget({
  model: string,
  maxContext: number,
  reserveForSystem: number,
  reserveForTools: number,
  reserveForAnswer: number,
  safetyMargin?: number // Default: 0.1 (10%)
}): TokenBudget

// Compute token breakdown for a request
computeTokenBreakdown({
  systemPrompt: string,
  historyMessages: ChatMessage[],
  retrievedContext: RetrievedContext,
  toolDefinitions?: ToolDefinition[]
}): TokenBreakdown

// Check if plan fits within budget
isWithinBudget(plan: TokenBudget): boolean

// Get detailed overflow explanation (debug helper)
explainOverflow(plan: TokenBudget): OverflowExplanation
```

**Types**:
```typescript
type TokenBudget = {
  model: string;
  totalBudget: number;
  systemReserve: number;
  toolsReserve: number;
  answerReserve: number;
  availableForContext: number;
  safetyMargin: number;
};

type TokenBreakdown = {
  systemPrompt: number;
  historyMessages: number;
  retrievedContext: number;
  toolDefinitions: number;
  total: number;
  remaining: number;
};

type OverflowExplanation = {
  isOverflow: boolean;
  overflowAmount: number;
  breakdown: TokenBreakdown;
  suggestions: string[];
};
```

---

### 3. Context Window Selection ⭐ (To Add)

**Purpose**: Select messages from conversation history based on token budgets.

**Functions**:

```typescript
// Select recent N messages
selectRecentMessages(
  messages: ChatMessage[], 
  keepN: number
): ChatMessage[]

// Select messages that fit within token budget
selectMessagesByTokenBudget(
  messages: ChatMessage[],
  options: {
    keepRecent: number,      // Always keep last N messages
    budgetTokens: number,     // Available token budget
    includeSummary?: boolean  // Whether summary is included
  }
): MessageSelectionPlan

// Select messages with summary integration
selectMessagesWithSummary(
  messages: ChatMessage[],
  summary: string | null,
  options: {
    keepRecent: number,
    budgetTokens: number,
    summaryTokens: number
  }
): MessageSelectionPlan
```

**Types**:
```typescript
type MessageSelectionPlan = {
  selectedHistory: ChatMessage[];
  droppedHistory: ChatMessage[];
  summary: string | null;
  totals: {
    selectedTokens: number;
    droppedTokens: number;
    summaryTokens: number;
    totalTokens: number;
  };
  fitsWithinBudget: boolean;
};
```

---

### 4. Summarization Policy ⭐ (To Enhance)

**Purpose**: Determine when conversations should be summarized based on model-specific thresholds.

**Current**: Basic `summarizeConversation()` function ✅

**Enhanced Functions** (To Add):

```typescript
// Model-specific summarization thresholds
const SUMMARIZATION_THRESHOLDS = {
  'gpt-4o': { 
    K: 14,              // Message threshold
    T: 2500,            // Token threshold
    COOLDOWN: 6,        // Minimum messages between summaries
    KEEP_RECENT: 8      // Keep last N messages un-summarized
  },
  'gpt-4o-mini': { 
    K: 14, 
    T: 2500, 
    COOLDOWN: 6, 
    KEEP_RECENT: 8 
  },
  'gpt-3.5-turbo': { 
    K: 10, 
    T: 2000, 
    COOLDOWN: 5, 
    KEEP_RECENT: 6 
  },
  'claude-3-opus': { 
    K: 20, 
    T: 3000, 
    COOLDOWN: 8, 
    KEEP_RECENT: 10 
  },
  // ... more models
};

// Enhanced summarization decision
shouldSummarize({
  totalMessages: number,
  lastSummarizedIndex: number,
  tokensSinceLastSummary: number,
  thresholds: SummarizationThresholds,
  model?: string
}): SummarizationDecision

// Compute which messages should be summarized
computeSummaryDelta({
  messages: ChatMessage[],
  lastSummaryCutoff: number,
  keepRecent?: number
}): SummaryDelta
```

**Types**:
```typescript
type SummarizationThresholds = {
  K: number;              // Message threshold
  T: number;              // Token threshold
  COOLDOWN: number;       // Cooldown period
  KEEP_RECENT: number;    // Keep recent messages
};

type SummarizationDecision = {
  shouldSummarize: boolean;
  reason: string;
  messagesSince: number;
  tokensSince: number;
  thresholds: SummarizationThresholds;
};

type SummaryDelta = {
  messagesToSummarize: ChatMessage[];
  messagesToKeep: ChatMessage[];
  startIndex: number;
  endIndex: number;
};
```

---

### 5. Context Formatting ⭐ (To Add)

**Purpose**: Format retrieved context for AI consumption (pure transforms).

**Functions**:

```typescript
// Format retrieved context into prompt-friendly shape
formatRetrievedContext({
  tasks?: Array<{ id: string; title: string; description: string }>,
  notes?: Array<{ id: string; title: string; description: string; blocks?: any }>,
  messages?: Array<{ id: string; content: string }>
}): FormattedContext

// Truncate context to fit token budget
truncateContext(
  context: FormattedContext,
  maxTokens: number
): FormattedContext

// Deduplicate context by ID or content hash
deduplicateContext(
  context: FormattedContext,
  strategy?: 'id' | 'content-hash'
): FormattedContext

// Redact sensitive information (pure transform)
redactSensitiveFields(
  context: FormattedContext,
  fieldsToRedact: string[]
): FormattedContext
```

**Types**:
```typescript
type FormattedContext = {
  tasks: string[];      // Formatted task strings
  notes: string[];      // Formatted note strings
  messages: string[];  // Formatted message strings
  metadata: {
    taskCount: number;
    noteCount: number;
    messageCount: number;
    totalTokens: number;
  };
};
```

---

### 6. Validation & Types ✅ (Partially Implemented)

**Current Types**:
- `TokenEstimate` ✅
- `EstimateTokensFromPrunedMessagesResult` ✅
- `SummarizeConversationResult` ✅
- `ChatMessage` ✅
- `PrunedMessage` ✅
- `PrunedContent` ✅

**Additional Types Needed** ⭐:
- `TokenBudget`
- `TokenBreakdown`
- `MessageSelectionPlan`
- `SummarizationDecision`
- `FormattedContext`
- `RetrievedContext`
- `ToolDefinition`

**Optional Zod Schemas** ⭐ (To Add):
```typescript
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
});

export const TokenBudgetSchema = z.object({
  model: z.string(),
  totalBudget: z.number(),
  systemReserve: z.number(),
  // ... more fields
});
```

---

### 7. Developer Ergonomics ⭐ (To Add)

**Debug Helpers**:

```typescript
// Describe a token budget plan in human-readable format
describePlan(plan: TokenBudget | MessageSelectionPlan): string

// Visualize token breakdown
visualizeTokenBreakdown(breakdown: TokenBreakdown): string

// Compare two plans
comparePlans(plan1: TokenBudget, plan2: TokenBudget): ComparisonResult
```

**Test Fixtures**:

```typescript
// Generate test messages with specific token counts
generateTestMessages(count: number, tokensPerMessage: number): ChatMessage[]

// Generate test context
generateTestContext(options: {
  taskCount?: number,
  noteCount?: number,
  messageCount?: number
}): RetrievedContext
```

---

## What Should NOT Be Included

### Hard Rules

❌ **No Express / HTTP**: No `req`, `res`, or HTTP-specific code  
❌ **No Database**: No Postgres, pgvector, Drizzle ORM, or any DB operations  
❌ **No Queues**: No BullMQ, Redis queues, or background job logic  
❌ **No Caches**: No Redis caching or cache invalidation logic  
❌ **No LLM Providers**: No OpenRouter, Vercel AI SDK, or provider-specific code  
❌ **No App Schemas**: No knowledge of tasks/notes/messages table structures  
❌ **No Side Effects**: No file I/O, network calls, or external API calls  

### Why These Rules?

- **Testability**: Pure functions are easy to test without mocking
- **Reusability**: Can be used in any Node.js application
- **Stability**: No breaking changes from external dependencies
- **Performance**: No I/O overhead, fast execution

---

## Package Structure

```
packages/Taskflow-Rag/
├── src/
│   ├── core/
│   │   ├── token-estimation.ts      ✅ (exists)
│   │   ├── token-budgeting.ts      ⭐ (to add)
│   │   ├── context-selection.ts    ⭐ (to add)
│   │   └── summarization-policy.ts  ⭐ (to enhance)
│   ├── utils/
│   │   ├── context-formatter.ts    ⭐ (to add)
│   │   ├── model-registry.ts       ⭐ (to add)
│   │   └── debug-helpers.ts        ⭐ (to add)
│   ├── types.ts                    ✅ (exists, expand)
│   └── index.ts                    ✅ (exists, expand)
├── tests/
│   ├── unit/
│   │   ├── token-estimation.test.ts
│   │   ├── token-budgeting.test.ts
│   │   └── context-selection.test.ts
│   └── fixtures/
│       └── test-data.ts
├── package.json                    ✅ (exists)
├── tsconfig.json                   ✅ (exists)
└── README.md                       ✅ (exists)
```

---

## API Surface (Complete)

### Token Estimation
```typescript
export function estimateTokens(content: string, tokenLimit?: number): TokenEstimate
export function estimateTokensFromMessages(messages: ChatMessage[], tokenLimit?: number): TokenEstimate
export function estimateTokensFromPrunedMessages(prunedMessages: PrunedMessage[], tokenLimit?: number): EstimateTokensFromPrunedMessagesResult
export const tokenService: TokenService
```

### Token Budgeting ⭐
```typescript
export function createTokenBudget(options: TokenBudgetOptions): TokenBudget
export function computeTokenBreakdown(options: TokenBreakdownOptions): TokenBreakdown
export function isWithinBudget(plan: TokenBudget): boolean
export function explainOverflow(plan: TokenBudget): OverflowExplanation
```

### Context Selection ⭐
```typescript
export function selectRecentMessages(messages: ChatMessage[], keepN: number): ChatMessage[]
export function selectMessagesByTokenBudget(messages: ChatMessage[], options: MessageSelectionOptions): MessageSelectionPlan
export function selectMessagesWithSummary(messages: ChatMessage[], summary: string | null, options: MessageSelectionOptions): MessageSelectionPlan
```

### Summarization Policy ⭐
```typescript
export function summarizeConversation(messages: ChatMessage[], tokenLimit?: number): SummarizeConversationResult
export function shouldSummarize(options: SummarizationOptions): SummarizationDecision
export function computeSummaryDelta(options: SummaryDeltaOptions): SummaryDelta
export const SUMMARIZATION_THRESHOLDS: Record<string, SummarizationThresholds>
```

### Context Formatting ⭐
```typescript
export function formatRetrievedContext(context: RetrievedContext): FormattedContext
export function truncateContext(context: FormattedContext, maxTokens: number): FormattedContext
export function deduplicateContext(context: FormattedContext, strategy?: 'id' | 'content-hash'): FormattedContext
export function redactSensitiveFields(context: FormattedContext, fields: string[]): FormattedContext
```

### Model Registry ⭐
```typescript
export const MODEL_LIMITS: Record<string, ModelLimits>
export function getModelLimits(model: string): ModelLimits | null
export function getRecommendedInputLimit(model: string): number | null
```

### Debug Helpers ⭐
```typescript
export function describePlan(plan: TokenBudget | MessageSelectionPlan): string
export function visualizeTokenBreakdown(breakdown: TokenBreakdown): string
export function comparePlans(plan1: TokenBudget, plan2: TokenBudget): ComparisonResult
```

---

## Usage Examples

### Token Budgeting

```typescript
import { createTokenBudget, computeTokenBreakdown, isWithinBudget } from '@taskflow/rag';

// Create a budget for GPT-4o
const budget = createTokenBudget({
  model: 'gpt-4o',
  maxContext: 128000,
  reserveForSystem: 2000,
  reserveForTools: 5000,
  reserveForAnswer: 4000,
  safetyMargin: 0.1
});

// Compute actual usage
const breakdown = computeTokenBreakdown({
  systemPrompt: systemPromptText,
  historyMessages: conversationHistory,
  retrievedContext: { tasks, notes, messages },
  toolDefinitions: toolDefs
});

// Check if it fits
if (!isWithinBudget({ ...budget, breakdown })) {
  // Need to reduce context
}
```

### Context Selection

```typescript
import { selectMessagesByTokenBudget } from '@taskflow/rag';

const plan = selectMessagesByTokenBudget(messages, {
  keepRecent: 8,
  budgetTokens: 8000,
  includeSummary: true
});

console.log(`Selected ${plan.selectedHistory.length} messages`);
console.log(`Dropped ${plan.droppedHistory.length} messages`);
console.log(`Total tokens: ${plan.totals.totalTokens}`);
```

### Summarization Decision

```typescript
import { shouldSummarize, SUMMARIZATION_THRESHOLDS } from '@taskflow/rag';

const decision = shouldSummarize({
  totalMessages: messages.length,
  lastSummarizedIndex: conversation.lastSummarizedIndex,
  tokensSinceLastSummary: estimatedTokens,
  thresholds: SUMMARIZATION_THRESHOLDS['gpt-4o'],
  model: 'gpt-4o'
});

if (decision.shouldSummarize) {
  console.log(`Should summarize: ${decision.reason}`);
  // Trigger summarization
}
```

---

## Implementation Roadmap

### Phase 1: Core Enhancements (Current)
- [x] Token estimation functions
- [ ] Enhanced summarization policy with model-specific thresholds
- [ ] Model registry

### Phase 2: Budgeting & Planning
- [ ] Token budgeting utilities
- [ ] Token breakdown computation
- [ ] Budget validation

### Phase 3: Context Management
- [ ] Context window selection
- [ ] Message selection by budget
- [ ] Summary integration

### Phase 4: Formatting & Utilities
- [ ] Context formatting
- [ ] Context truncation
- [ ] Deduplication helpers

### Phase 5: Developer Experience
- [ ] Debug helpers
- [ ] Test fixtures
- [ ] Enhanced documentation

---

## Dependencies

### Current
- `gpt-tokenizer` (^3.4.0) - Token counting

### Optional (To Consider)
- `zod` (^3.25.76) - Schema validation (optional, for type-safe validation)

---

## Testing Strategy

### Unit Tests
- All functions should be pure and easily testable
- No mocking required (no external dependencies)
- Test edge cases: empty inputs, large inputs, boundary conditions

### Test Coverage Goals
- Token estimation: 100% coverage
- Budgeting: 95%+ coverage
- Context selection: 95%+ coverage
- Summarization policy: 95%+ coverage

---

## Integration with @taskflow/user-context

`@taskflow/user-context` will use `@taskflow/rag` for:

1. **Token Budgeting**: Before making LLM calls
2. **Context Selection**: When preparing conversation history
3. **Summarization Decisions**: When determining if summarization is needed
4. **Context Formatting**: When formatting retrieved context for prompts

**Example Integration**:
```typescript
// In @taskflow/user-context
import { 
  createTokenBudget, 
  selectMessagesByTokenBudget,
  shouldSummarize 
} from '@taskflow/rag';

class ContextWindowService {
  getContextWindow(messages, summary, options) {
    // Use @taskflow/rag for selection logic
    const plan = selectMessagesByTokenBudget(messages, {
      keepRecent: options.keepRecent,
      budgetTokens: options.budgetTokens
    });
    
    return {
      summary,
      messages: plan.selectedHistory,
      totalTokens: plan.totals.totalTokens
    };
  }
}
```

---

## Version History

- **v1.0.0** (Current)
  - Token estimation functions
  - Basic summarization decision
  - Type definitions

- **v1.1.0** (Planned)
  - Token budgeting utilities
  - Enhanced summarization policy
  - Model registry

- **v1.2.0** (Planned)
  - Context window selection
  - Context formatting utilities

---

## License

MIT

## Author

Howard Thomas

