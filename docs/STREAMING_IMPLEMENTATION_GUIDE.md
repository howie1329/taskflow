# Streaming Implementation Guide

## Quick Reference

This guide provides a quick reference for implementing streaming in TaskFlow. For detailed exploration, see `STREAMING_OPTIONS_EXPLORATION.md`.

## Current State

- **Current Implementation**: Fetch API with ReadableStream (`src/hooks/ai/utils/StreamingUtils.js`)
- **Protocol**: Custom text-based with prefixes (`json:`, `text:`, `ToolCallStart:`, `ToolCallEnd:`)
- **Socket.io**: Already installed and used for notifications

## Available Utilities

All streaming utilities are located in `src/lib/streaming/`:

1. **SSE Client** (`sseClient.js`) - Server-Sent Events
2. **WebSocket Streaming** (`websocketStreaming.js`) - Socket.io-based
3. **Enhanced Fetch** (`enhancedFetchStreaming.js`) - Improved fetch streaming

## Quick Decision Matrix

| Feature | Recommended Approach | Why |
|---------|---------------------|-----|
| AI Chat (one-way) | SSE | Simpler, auto-reconnect |
| AI Chat (bidirectional) | WebSocket | Full-duplex, low latency |
| Real-time task updates | WebSocket | Already have infrastructure |
| File uploads | Enhanced Fetch | Current approach works |
| Notifications | WebSocket | Already implemented |

## Implementation Steps

### Option 1: Migrate to SSE (Recommended for AI Chat)

**Step 1**: Update backend to send SSE format
```javascript
// Backend (Express.js)
res.setHeader('Content-Type', 'text/event-stream');
res.write(`data: ${JSON.stringify(chunk)}\n\n`);
```

**Step 2**: Replace current hook
```javascript
// Replace useSendAIMessage with:
import { useAIChatSSE } from '@/lib/streaming/examples/aiChatSSE';

const { sendMessage, status } = useAIChatSSE(conversationId);
```

**Step 3**: Update UI components
- Replace `processStreamResponse` calls
- Use `status.isConnected` for loading states

### Option 2: Extend WebSocket (Recommended for Real-time Features)

**Step 1**: Add AI chat namespace to Socket.io
```javascript
// Backend
io.on('connection', (socket) => {
  socket.on('ai-chat:send', handleAIChat);
});
```

**Step 2**: Use WebSocket streaming hook
```javascript
import { useAIChatWebSocket } from '@/lib/streaming/examples/aiChatWebSocket';

const { sendMessage, abort, status } = useAIChatWebSocket(conversationId);
```

**Step 3**: Add abort functionality to UI
- Add "Stop" button that calls `abort()`

### Option 3: Enhance Current Fetch (Quick Win)

**Step 1**: Replace current streaming utility
```javascript
import { useAIChatEnhancedFetch } from '@/lib/streaming/examples/aiChatEnhancedFetch';

const { sendMessage, abort, status } = useAIChatEnhancedFetch(conversationId);
```

**Step 2**: Add abort button
```javascript
{status.isStreaming && (
  <button onClick={abort}>Stop</button>
)}
```

## Code Examples

### Basic SSE Usage

```javascript
import { useSSE } from '@/lib/streaming';

const { send, status } = useSSE({
  url: '/api/v1/stream',
  getAuthToken: async () => await getToken(),
  onMessage: (data) => {
    // Handle message
  },
});
```

### Basic WebSocket Usage

```javascript
import { useAIChatStreaming } from '@/lib/streaming';

const { sendMessage, abort } = useAIChatStreaming(conversationId, {
  onChunk: (chunk) => {
    // Handle chunk
  },
  onComplete: (final) => {
    // Handle completion
  },
});
```

### Basic Enhanced Fetch Usage

```javascript
import { useEnhancedFetchStreaming } from '@/lib/streaming';

const { start, abort } = useEnhancedFetchStreaming({
  url: '/api/v1/stream',
  getAuthToken: async () => await getToken(),
  onChunk: (chunk) => {
    // Handle chunk
  },
});
```

## Migration Checklist

- [ ] Choose streaming approach based on requirements
- [ ] Update backend to support chosen approach
- [ ] Replace `useSendAIMessage` hook
- [ ] Update `StreamingUtils.js` or remove if not needed
- [ ] Update UI components to use new hooks
- [ ] Add abort/stop functionality
- [ ] Test reconnection handling
- [ ] Test error handling
- [ ] Update documentation

## Testing Strategy

1. **Unit Tests**: Mock streaming utilities
2. **Integration Tests**: Test with real backend
3. **Performance Tests**: Compare latency and throughput
4. **Error Tests**: Test reconnection and error handling

## Performance Benchmarks

Based on typical implementations:

- **SSE**: ~5-10ms latency, low overhead
- **WebSocket**: ~1-5ms latency, medium overhead
- **Fetch**: ~10-20ms latency, low overhead

## Common Issues and Solutions

### Issue: SSE not reconnecting
**Solution**: Check `shouldReconnect` flag and retry logic

### Issue: WebSocket connection drops
**Solution**: Verify Socket.io reconnection is enabled

### Issue: Fetch streaming stops unexpectedly
**Solution**: Check abort controller and error handling

## Next Steps

1. Review `STREAMING_OPTIONS_EXPLORATION.md` for detailed analysis
2. Check `src/lib/streaming/README.md` for API reference
3. Review examples in `src/lib/streaming/examples/`
4. Choose approach based on your specific needs
5. Implement proof of concept
6. Measure performance
7. Plan full migration

## Resources

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
