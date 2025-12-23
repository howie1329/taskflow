# User Context/RAG Package - Tech Stack Recommendations

## Recommended Tech Stack

### Core Stack (Keep Current)

✅ **Node.js with ES Modules** - Already using, keep it
✅ **PostgreSQL with pgvector** - Perfect for vector similarity search
✅ **Drizzle ORM** - Already integrated, keep it
✅ **Vercel AI SDK (`ai` package)** - Already using, excellent choice
✅ **BullMQ** - For background embedding/summarization jobs
✅ **Redis** - For caching and job queues

### Embedding Model (Current)

✅ **Google Gemini Embedding (`gemini-embedding-001`)** - 1536 dimensions

- Keep this, it's working well
- Consider alternatives: OpenAI `text-embedding-3-small` (1536) or `text-embedding-3-large` (3072) if you need more dimensions

### LLM Provider (Current)

✅ **OpenRouter** - Good choice for flexibility

- Using `openai/gpt-oss-20b:free` for summarization/decisions
- Consider model-specific token limits (see below)

### Recommended Additions

#### 1. **Token Counting Library** ⭐ Highly Recommended

```bash
npm install gpt-tokenizer
# OR
npm install tiktoken
```

**Why:** Your current token estimation (`words * 1.3`) is rough. Use a proper tokenizer:

- `gpt-tokenizer` - Fast, supports multiple models
- `tiktoken` - Official OpenAI tokenizer, very accurate

**Usage:**

```javascript
import { encode } from "gpt-tokenizer";

function estimateTokens(text, model = "gpt-4") {
  return encode(text).length;
}
```

#### 2. **TypeScript** (Optional but Recommended)

```bash
npm install -D typescript @types/node
```

**Why:** Better type safety, IDE support, fewer runtime errors

#### 3. **Zod** (Already Using ✅)

- Keep using for schema validation
- Great for validating context data structures

### Package Structure

```
packages/user-context-rag/
├── src/
│   ├── core/
│   │   ├── EmbeddingService.js          # Embedding creation & management
│   │   ├── ContextRetrievalService.js   # Smart context search (RAG)
│   │   ├── SummarizationService.js      # Conversation summarization
│   │   └── ContextWindowService.js      # Context windowing logic
│   │
│   ├── jobs/
│   │   ├── EmbeddingJob.js              # Background embedding jobs
│   │   ├── SummarizationJob.js         # Background summarization jobs
│   │   └── index.js                     # Job queue setup
│   │
│   ├── database/
│   │   ├── ContextOperations.js         # DB ops for context data
│   │   └── migrations/                  # Context-related migrations
│   │
│   ├── utils/
│   │   ├── TokenEstimator.js            # Accurate token counting
│   │   ├── ContextFormatter.js          # Format context for AI
│   │   └── ThresholdCalculator.js       # Summarization thresholds
│   │
│   └── index.js                         # Main export
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── package.json
├── tsconfig.json                         # If using TypeScript
└── README.md
```

### Dependencies for package.json

```json
{
  "name": "@taskflow/user-context-rag",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.js",
  "dependencies": {
    "ai": "^5.0.60",
    "@ai-sdk/google": "^2.0.11",
    "@openrouter/ai-sdk-provider": "^1.2.0",
    "drizzle-orm": "^0.44.5",
    "bullmq": "^5.58.7",
    "gpt-tokenizer": "^2.1.2",
    "zod": "^3.25.76"
  },
  "peerDependencies": {
    "postgres": "^3.4.7",
    "ioredis": "^5.7.0"
  }
}
```

---

## Token Limits & Best Practices

### Model Context Windows

| Model           | Context Window | Recommended Input | Max Safe Input |
| --------------- | -------------- | ----------------- | -------------- |
| GPT-4o          | 128K           | 100K              | 120K           |
| GPT-4o-mini     | 128K           | 100K              | 120K           |
| GPT-4 Turbo     | 128K           | 100K              | 120K           |
| GPT-3.5 Turbo   | 16K            | 12K               | 14K            |
| Claude 3 Opus   | 200K           | 150K              | 180K           |
| Claude 3 Sonnet | 200K           | 150K              | 180K           |
| Gemini Pro      | 32K            | 24K               | 28K            |

### Recommended Token Limits Per Message

#### For Chat Messages (User → AI)

**Max tokens per message: 4,000-8,000 tokens**

**Breakdown:**

- **User message**: 500-2,000 tokens (typical: 100-500)
- **System prompt**: 500-1,500 tokens
- **Context (RAG results)**: 1,000-3,000 tokens
- **Conversation history**: 1,000-2,000 tokens
- **Buffer for response**: 2,000-4,000 tokens

**Total safe limit: ~8,000 tokens per request**

#### For Summarization

**Trigger summarization when:**

- **Token threshold**: 2,000-3,000 tokens since last summary
- **Message threshold**: 12-16 messages since last summary
- **Cooldown**: Minimum 6 messages between summaries

**Keep un-summarized:**

- Last 6-10 messages (for recency fidelity)

### Current vs Recommended Thresholds

**Your Current (from SummaryService.js):**

```javascript
const threshold = { K: 1, T: 300, COOLDOWN: 5 };
```

❌ **Too aggressive** - Summarizing too frequently

**Recommended:**

```javascript
const threshold = {
  K: 14, // Messages threshold (was 1)
  T: 2500, // Token threshold (was 300)
  COOLDOWN: 6, // Cooldown messages (was 5)
  KEEP_RECENT: 8, // Keep last N messages un-summarized
};
```

### Token Estimation Best Practices

#### Current Implementation (Rough)

```javascript
// Current: words * 1.3
estimateTokens(messages) {
  return Math.ceil(
    messages.map(m => m.content).join(" ").split(/\s+/).length * 1.3
  );
}
```

#### Recommended (Accurate)

```javascript
import { encode } from "gpt-tokenizer";

class TokenEstimator {
  estimateTokens(text, model = "gpt-4") {
    try {
      return encode(text, { model }).length;
    } catch (error) {
      // Fallback to word-based estimation
      return Math.ceil(text.split(/\s+/).length * 1.3);
    }
  }

  estimateMessages(messages, model = "gpt-4") {
    const content = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    return this.estimateTokens(content, model);
  }
}
```

### Context Window Management

#### Recommended Strategy

```javascript
class ContextWindowService {
  getContextWindow(
    messages,
    summary = null,
    options = {
      maxTokens: 8000, // Max tokens for context
      recentMessages: 8, // Always keep last N messages
      summaryTokens: 500, // Reserve tokens for summary
    }
  ) {
    const recent = messages.slice(-options.recentMessages);
    const recentTokens = this.estimateTokens(recent);

    const availableTokens =
      options.maxTokens - options.summaryTokens - recentTokens;

    // Add older messages if space allows
    const olderMessages = messages.slice(0, -options.recentMessages);
    const selectedOlder = this.selectMessagesByTokens(
      olderMessages,
      availableTokens
    );

    return {
      summary,
      messages: [...selectedOlder, ...recent],
      totalTokens: this.estimateTokens([...selectedOlder, ...recent]),
    };
  }
}
```

### RAG Context Limits

**Per RAG retrieval:**

- **Tasks**: 5-10 items (~500-1,500 tokens)
- **Messages**: 3-5 items (~300-800 tokens)
- **Notes**: 3-5 items (~500-1,500 tokens)

**Total RAG context: ~1,500-3,500 tokens**

### Safety Margins

Always leave buffer:

- **20% buffer** for model overhead
- **10% buffer** for system prompts
- **10% buffer** for response generation

**Example:**

- Model context: 128K
- Safe input: 100K (78% of context)
- Max per message: 8K (6% of context)

---

## Implementation Recommendations

### 1. Token Counting Service

```javascript
// packages/user-context-rag/src/utils/TokenEstimator.js
import { encode } from "gpt-tokenizer";

export class TokenEstimator {
  constructor(model = "gpt-4") {
    this.model = model;
  }

  estimate(text) {
    try {
      return encode(text, { model: this.model }).length;
    } catch {
      // Fallback
      return Math.ceil(text.split(/\s+/).length * 1.3);
    }
  }

  estimateMessages(messages) {
    const content = messages
      .map((m) => `${m.role}: ${m.content || ""}`)
      .join("\n");
    return this.estimate(content);
  }

  estimateContext(context) {
    if (Array.isArray(context)) {
      return context.reduce(
        (sum, item) => sum + this.estimate(JSON.stringify(item)),
        0
      );
    }
    return this.estimate(JSON.stringify(context));
  }
}
```

### 2. Updated Summarization Thresholds

```javascript
// packages/user-context-rag/src/utils/ThresholdCalculator.js
export class ThresholdCalculator {
  static getDefaultThresholds(model = "gpt-4") {
    const modelThresholds = {
      "gpt-4": { K: 14, T: 2500, COOLDOWN: 6, KEEP_RECENT: 8 },
      "gpt-4o-mini": { K: 14, T: 2500, COOLDOWN: 6, KEEP_RECENT: 8 },
      "gpt-3.5-turbo": { K: 10, T: 2000, COOLDOWN: 5, KEEP_RECENT: 6 },
      "claude-3-opus": { K: 20, T: 3000, COOLDOWN: 8, KEEP_RECENT: 10 },
    };

    return modelThresholds[model] || modelThresholds["gpt-4"];
  }

  shouldSummarize(
    totalMessages,
    lastSummarizedIndex,
    estimatedTokensSince,
    thresholds
  ) {
    const messagesSince = totalMessages - (lastSummarizedIndex || 0);

    const passedThreshold =
      messagesSince >= thresholds.K || estimatedTokensSince >= thresholds.T;

    const passedCooldown = messagesSince >= thresholds.COOLDOWN;

    const enoughMessages = messagesSince >= thresholds.KEEP_RECENT;

    return passedThreshold && passedCooldown && enoughMessages;
  }
}
```

### 3. Context Window Service

```javascript
// packages/user-context-rag/src/core/ContextWindowService.js
export class ContextWindowService {
  constructor(tokenEstimator) {
    this.tokenEstimator = tokenEstimator;
  }

  getContextWindow(
    messages,
    summary = null,
    options = {
      maxTokens: 8000,
      recentMessages: 8,
      summaryTokens: 500,
    }
  ) {
    // Always keep recent messages
    const recent = messages.slice(-options.recentMessages);
    const recentTokens = this.tokenEstimator.estimateMessages(recent);

    // Calculate available tokens
    const summaryTokenCount = summary
      ? this.tokenEstimator.estimate(summary)
      : 0;

    const availableTokens =
      options.maxTokens - summaryTokenCount - recentTokens - 1000; // Buffer for system prompt and overhead

    // Select older messages that fit
    const olderMessages = messages.slice(0, -options.recentMessages);
    const selectedOlder = this.selectMessagesByTokens(
      olderMessages,
      Math.max(0, availableTokens)
    );

    return {
      summary,
      messages: [...selectedOlder, ...recent],
      totalTokens:
        this.tokenEstimator.estimateMessages([...selectedOlder, ...recent]) +
        summaryTokenCount,
    };
  }

  selectMessagesByTokens(messages, maxTokens) {
    const selected = [];
    let currentTokens = 0;

    // Start from most recent older messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const messageTokens = this.tokenEstimator.estimateMessages([messages[i]]);
      if (currentTokens + messageTokens <= maxTokens) {
        selected.unshift(messages[i]);
        currentTokens += messageTokens;
      } else {
        break;
      }
    }

    return selected;
  }
}
```

---

## Summary

### Tech Stack ✅

- **Keep**: Node.js, PostgreSQL+pgvector, Drizzle ORM, Vercel AI SDK, BullMQ, Redis
- **Add**: `gpt-tokenizer` or `tiktoken` for accurate token counting
- **Consider**: TypeScript for better type safety

### Token Limits ✅

- **Max per message**: 8,000 tokens (safe for 128K context models)
- **Summarization trigger**: 2,500 tokens OR 14 messages
- **Cooldown**: 6 messages minimum
- **Keep recent**: Last 8 messages un-summarized
- **RAG context**: 1,500-3,500 tokens total

### Key Improvements

1. ✅ Replace rough token estimation with `gpt-tokenizer`
2. ✅ Update summarization thresholds (K: 14, T: 2500)
3. ✅ Implement proper context windowing with token limits
4. ✅ Add model-specific thresholds
5. ✅ Keep safety margins (20% buffer)
