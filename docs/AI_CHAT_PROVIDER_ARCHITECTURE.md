# AI Chat Provider Architecture

## Overview

This document explains the provider architecture for the AI Chat feature and provides recommendations for implementation.

## Current Provider Structure

### 1. **ChatHistoryProvider** ✅
- **Purpose**: Manages the list of conversations
- **Data**: `conversations`, `conversationsLoading`
- **Hook**: `useFetchConversations()`
- **Status**: Well-implemented

### 2. **ChatMessageProvider** ✅
- **Purpose**: Manages chat messages and the `useChat` hook integration
- **Data**: `messages`, `sendMessage`, `status`, `conversation`, `conversationLoading`, `messagesLoading`
- **Hook**: `useChat` from `@ai-sdk/react`
- **Status**: Well-implemented, correctly wraps `useChat`

### 3. **ChatSettingsProvider** ✨ NEW
- **Purpose**: Manages user input settings (model, smart context, context window)
- **Data**: `model`, `isSmartContext`, `contextWindow` + setters
- **Why Separate**: 
  - Single Responsibility Principle
  - Settings can be shared across multiple components
  - Settings can persist across conversation changes
  - Easier to test and maintain
- **Status**: ✅ Implemented

### 4. **ModelProvider** ✨ NEW
- **Purpose**: Provides OpenRouter model data to components
- **Data**: `models`, `modelsLoading`, `modelsError`
- **Why Separate**:
  - Models are fetched from external API (OpenRouter)
  - Can be shared across multiple components
  - Centralizes model fetching logic
  - Can cache model data efficiently
- **Status**: ✅ Implemented (optional - components can still use hook directly)

## Provider Hierarchy

```
ModelProvider (outermost - optional)
  └── ChatHistoryProvider
      └── ChatSettingsProvider
          └── ChatMessageProvider (innermost)
              └── Your Components
```

### Why This Order?

1. **ModelProvider** (outermost): Models are fetched once and shared everywhere
2. **ChatHistoryProvider**: Conversation list is needed before selecting a conversation
3. **ChatSettingsProvider**: Settings should be available before sending messages
4. **ChatMessageProvider** (innermost): Messages depend on conversationId and settings

## Component Updates

### AIChatInputArea
- ✅ Now uses `useChatSettingsContext()` instead of local state
- ✅ Settings are shared and can persist across renders
- ✅ No longer needs `model` prop (gets it from context)

### AIModelSelector
- ✅ Can optionally use `ModelProvider` context
- ✅ Still works standalone using `useFetchModelSelector()` hook
- ✅ Backward compatible

## Recommendations

### ✅ DO: Use Separate Settings Provider

**Reason**: Settings (model, smart context, context window) are:
- User preferences that should persist
- Used by multiple components
- Not directly related to message sending logic
- Easier to test in isolation

**Example**:
```jsx
<ChatSettingsProvider defaultModel={conversation?.lastModel}>
  <ChatMessageProvider conversationId={id}>
    <AIChatInputArea />
  </ChatMessageProvider>
</ChatSettingsProvider>
```

### ✅ DO: Use Model Provider for OpenRouter Models

**Reason**: 
- Models are fetched from external API
- Can be expensive to fetch multiple times
- Shared across multiple components (selector, settings, etc.)
- Centralizes loading/error states

**Example**:
```jsx
<ModelProvider>
  {/* All components can access models */}
  <AIModelSelector />
  <ModelInfo />
</ModelProvider>
```

### ❌ DON'T: Put Settings in ChatMessageProvider

**Why Not**:
- Violates Single Responsibility Principle
- Settings are not messages
- Settings should persist even when messages change
- Harder to test and maintain

### ✅ DO: Keep Settings Separate from useChat

**Why**:
- `useChat` handles message sending/receiving
- Settings handle user preferences
- They serve different purposes
- Easier to reason about and debug

## Migration Path

### For Existing Pages

1. Wrap page with providers:
```jsx
<ModelProvider>
  <ChatHistoryProvider>
    <ChatSettingsProvider defaultModel={lastUsedModel}>
      <ChatMessageProvider conversationId={id}>
        {/* Your components */}
      </ChatMessageProvider>
    </ChatSettingsProvider>
  </ChatHistoryProvider>
</ModelProvider>
```

2. Update components to use contexts:
```jsx
// Before
const [model, setModel] = useState("");

// After
const { model, setModel } = useChatSettingsContext();
```

3. Remove props that are now in context:
```jsx
// Before
<AIChatInputArea model={model} />

// After
<AIChatInputArea />
```

## Benefits

1. **Separation of Concerns**: Each provider has a single responsibility
2. **Reusability**: Settings can be shared across components
3. **Testability**: Each provider can be tested independently
4. **Maintainability**: Changes to one area don't affect others
5. **Performance**: Model data can be cached and shared
6. **Type Safety**: Each context has clear types

## Example Usage

```jsx
// Test Page Example
export default function TestPage() {
  return (
    <ModelProvider>
      <ChatHistoryProvider>
        <ChatSettingsProvider>
          <ChatMessageProvider conversationId={null}>
            <ChatPageClient />
          </ChatMessageProvider>
        </ChatSettingsProvider>
      </ChatHistoryProvider>
    </ModelProvider>
  );
}

// Component Example
function ChatPageClient() {
  const { messages, sendMessage, status } = useChatMessageContext();
  const { model, isSmartContext, contextWindow } = useChatSettingsContext();
  const { models } = useModelContext();

  const handleSend = (text) => {
    sendMessage({
      text,
      metadata: { model, isSmartContext, contextWindow }
    });
  };

  return (
    <div>
      <AIChatInputArea handleSendMessage={handleSend} status={status} />
      {/* messages display */}
    </div>
  );
}
```

## Next Steps

1. ✅ Update test page to use new providers
2. ⏳ Update main AI chat page (`/mainview/aichat/[id]/page.js`) to use providers
3. ⏳ Consider persisting settings to localStorage
4. ⏳ Add TypeScript types for better type safety
5. ⏳ Add error boundaries for each provider
