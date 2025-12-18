# Streaming Utilities

This directory contains utilities for implementing different streaming approaches in TaskFlow.

## Overview

Three main streaming approaches are provided:

1. **Server-Sent Events (SSE)** - One-way server-to-client streaming
2. **WebSocket Streaming** - Bidirectional streaming using Socket.io
3. **Enhanced Fetch Streaming** - Improved version of current fetch-based approach

## Quick Start

### Server-Sent Events

```javascript
import { useSSE } from '@/lib/streaming/sseClient';

const { send, status } = useSSE({
  url: '/api/v1/stream',
  getAuthToken: async () => await getToken(),
  onMessage: (data) => console.log(data),
  customEvents: {
    'tool-call': (data) => handleToolCall(data),
  },
});
```

### WebSocket Streaming

```javascript
import { useAIChatStreaming } from '@/lib/streaming/websocketStreaming';

const { sendMessage, abort, status } = useAIChatStreaming(conversationId, {
  onChunk: (chunk) => updateMessage(chunk),
  onComplete: (final) => handleComplete(final),
});
```

### Enhanced Fetch Streaming

```javascript
import { useEnhancedFetchStreaming } from '@/lib/streaming/enhancedFetchStreaming';

const { start, abort, status } = useEnhancedFetchStreaming({
  url: '/api/v1/stream',
  getAuthToken: async () => await getToken(),
  parser: 'custom', // or 'json', 'sse', 'text'
  onChunk: (chunk) => handleChunk(chunk),
});
```

## Examples

See the `examples/` directory for complete usage examples:

- `aiChatSSE.js` - AI chat using SSE
- `aiChatWebSocket.js` - AI chat using WebSockets
- `aiChatEnhancedFetch.js` - AI chat using enhanced fetch
- `comparison.js` - Side-by-side comparison

## Choosing the Right Approach

### Use SSE when:
- ✅ One-way streaming (server → client)
- ✅ Simple implementation needed
- ✅ Automatic reconnection desired
- ✅ Working with HTTP infrastructure

### Use WebSocket when:
- ✅ Bidirectional communication needed
- ✅ Low latency required
- ✅ Already using Socket.io
- ✅ Real-time collaboration features

### Use Enhanced Fetch when:
- ✅ Current fetch approach works but needs improvements
- ✅ Want abort support and better error handling
- ✅ File uploads/downloads
- ✅ Simple request/response streaming

## Migration Guide

### From Current Implementation to SSE

1. Replace `processStreamResponse` with `useSSE` hook
2. Update backend to send SSE format (`data: {...}\n\n`)
3. Use custom events for tool calls

### From Current Implementation to WebSocket

1. Extend existing Socket.io setup
2. Replace fetch call with `useAIChatStreaming`
3. Update backend to emit streaming events

### Enhance Current Implementation

1. Replace fetch calls with `useEnhancedFetchStreaming`
2. Add abort support
3. Improve error handling

## API Reference

### SSEClient

```javascript
class SSEClient {
  constructor(options)
  async connect()
  close()
  async send(data)
  getStatus()
}
```

### WebSocketStreamer

```javascript
class WebSocketStreamer {
  constructor(socket, options)
  sendMessage(message, options)
  abort()
  cleanup()
  setConversationId(id)
}
```

### EnhancedFetchStreamer

```javascript
class EnhancedFetchStreamer {
  constructor(options)
  async start(data, options)
  abort()
  getStatus()
}
```

## Backend Requirements

### SSE Backend Example (Express.js)

```javascript
app.get('/api/v1/conversations/:id/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const stream = createAIStream(req.params.id);
  
  stream.on('chunk', (chunk) => {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  });
  
  stream.on('tool-call', (toolCall) => {
    res.write(`event: tool-call\ndata: ${JSON.stringify(toolCall)}\n\n`);
  });
  
  req.on('close', () => {
    stream.destroy();
  });
});
```

### WebSocket Backend Example (Socket.io)

```javascript
io.on('connection', (socket) => {
  socket.on('ai-chat:send', async (data) => {
    const stream = await createAIStream(data);
    
    for await (const chunk of stream) {
      socket.emit('ai-chat:chunk', {
        streamId: data.streamId,
        ...chunk,
      });
    }
    
    socket.emit('ai-chat:complete', {
      streamId: data.streamId,
      finalMessage,
    });
  });
  
  socket.on('ai-chat:abort', (data) => {
    abortStream(data.streamId);
  });
});
```

## Testing

Each streaming utility can be tested independently:

```javascript
// Test SSE
const sseClient = new SSEClient({ url: '/test/stream' });
await sseClient.connect();

// Test WebSocket
const streamer = new WebSocketStreamer(socket, { namespace: 'test' });
streamer.sendMessage('test');

// Test Enhanced Fetch
const fetchStreamer = new EnhancedFetchStreamer({ url: '/test/stream' });
await fetchStreamer.start({ message: 'test' });
```

## Performance Considerations

- **SSE**: Lower overhead than WebSockets, but one-way only
- **WebSocket**: Lowest latency, but requires persistent connection
- **Fetch**: Stateless, easier to scale, but higher latency

See `docs/STREAMING_OPTIONS_EXPLORATION.md` for detailed performance analysis.

## Troubleshooting

### SSE Connection Issues
- Check CORS configuration
- Verify authentication token is passed correctly
- Check browser connection limits (6 per domain)

### WebSocket Connection Issues
- Verify Socket.io server is running
- Check authentication during handshake
- Review connection state management

### Fetch Streaming Issues
- Verify response body is readable
- Check abort controller is working
- Review error handling logic

## Contributing

When adding new streaming utilities:

1. Follow the existing pattern
2. Include React hooks for easy integration
3. Add comprehensive error handling
4. Document backend requirements
5. Add usage examples
