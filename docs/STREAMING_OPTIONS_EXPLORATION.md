# Streaming Options Exploration

This document explores different streaming approaches available for TaskFlow, analyzing their pros, cons, and use cases for various features.

## Current Implementation

### Current Approach: Fetch API with ReadableStream
- **Location**: `src/hooks/ai/utils/StreamingUtils.js`
- **Protocol**: Custom text-based protocol with prefixes (`json:`, `text:`, `ToolCallStart:`, `ToolCallEnd:`)
- **Pros**:
  - Simple HTTP-based, works with existing infrastructure
  - No additional dependencies
  - Good browser support
- **Cons**:
  - One-way streaming (client → server → client)
  - Manual protocol parsing required
  - No built-in reconnection handling
  - Limited to HTTP request/response cycle

---

## Streaming Options Comparison

### 1. Server-Sent Events (SSE)

**What it is**: HTTP-based protocol for server-to-client streaming using EventSource API.

**Implementation Example**:
```javascript
// Client-side
const eventSource = new EventSource('/api/v1/stream', {
  headers: { Authorization: token }
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle streaming data
};

eventSource.addEventListener('tool-call', (event) => {
  // Handle custom event types
});

// Server-side (Express.js)
app.get('/api/v1/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const stream = createStream();
  stream.on('data', (chunk) => {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  });
  
  req.on('close', () => {
    stream.destroy();
  });
});
```

**Pros**:
- ✅ Simple HTTP-based, works through proxies/firewalls
- ✅ Automatic reconnection built into EventSource
- ✅ Supports custom event types
- ✅ Better than fetch for long-lived connections
- ✅ Works with existing authentication headers

**Cons**:
- ❌ One-way only (server → client)
- ❌ Limited to text data (JSON serialization needed)
- ❌ Browser connection limits (6 per domain)
- ❌ No built-in compression

**Best For**:
- AI chat streaming (replacing current fetch approach)
- Real-time notifications
- Progress updates
- Live data feeds

**Migration Path**:
- Replace `processStreamResponse` with EventSource
- Update backend to send SSE format
- Add reconnection handling

---

### 2. WebSockets (Socket.io) - Already Partially Implemented

**What it is**: Full-duplex communication protocol over TCP.

**Current Usage**: 
- Socket.io already installed (`socket.io`, `socket.io-client`)
- Used for notifications (`notification-created`, `notifications-clean-up`)
- Located in `src/lib/sockets/`

**Implementation Example**:
```javascript
// Client-side
socket.emit('ai-chat:message', {
  conversationId,
  message,
  model,
  settings
});

socket.on('ai-chat:stream-chunk', (chunk) => {
  // Handle streaming chunk
  updateMessage(chunk);
});

socket.on('ai-chat:tool-call', (toolCall) => {
  // Handle tool call
});

socket.on('ai-chat:complete', (finalMessage) => {
  // Handle completion
});

// Server-side
io.on('connection', (socket) => {
  socket.on('ai-chat:message', async (data) => {
    const stream = await createAIStream(data);
    
    for await (const chunk of stream) {
      socket.emit('ai-chat:stream-chunk', chunk);
    }
    
    socket.emit('ai-chat:complete', finalMessage);
  });
});
```

**Pros**:
- ✅ Full-duplex (bidirectional)
- ✅ Low latency
- ✅ Already partially implemented
- ✅ Built-in reconnection
- ✅ Room/namespace support for scaling
- ✅ Can send binary data

**Cons**:
- ❌ More complex than SSE
- ❌ May not work through some proxies/firewalls
- ❌ Requires persistent connection management
- ❌ Higher server resource usage

**Best For**:
- AI chat streaming (bidirectional)
- Real-time collaboration
- Live task updates
- Interactive features requiring back-and-forth

**Enhancement Opportunities**:
- Extend current Socket.io implementation for AI chat
- Add room-based isolation per conversation
- Implement message queuing for offline support

---

### 3. Vercel AI SDK Streaming (Partially Implemented)

**What it is**: High-level streaming abstraction from Vercel AI SDK.

**Current Usage**:
- `@ai-sdk/react` and `ai` packages installed
- `useChat` hook used in `ChatMessageProvider.js`
- Custom `DefaultChatTransport` configured

**Implementation Example**:
```javascript
// Using useChat hook (already partially implemented)
const { messages, append, isLoading } = useChat({
  api: '/api/chat',
  streamProtocol: 'data', // or 'text' or 'sse'
  onFinish: (message) => {
    // Handle completion
  },
  onToolCall: ({ toolCall }) => {
    // Handle tool calls
  },
});

// Backend API Route (Next.js)
export async function POST(req) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4'),
    messages,
    tools: {
      createTask: {
        // tool definition
      }
    }
  });
  
  return result.toDataStreamResponse();
}
```

**Pros**:
- ✅ High-level abstraction, less boilerplate
- ✅ Built-in tool calling support
- ✅ Multiple protocol support (data, text, SSE)
- ✅ Automatic message management
- ✅ TypeScript support
- ✅ Works with Next.js API routes

**Cons**:
- ❌ Tied to Vercel AI SDK ecosystem
- ❌ Less control over streaming protocol
- ❌ May not work well with separate Express backend
- ❌ Requires Next.js API routes or adapter

**Best For**:
- AI chat (if migrating to Next.js API routes)
- Quick prototyping
- Standard AI use cases

**Migration Considerations**:
- Would need to move backend logic to Next.js API routes
- Or create adapter for Express.js backend
- Evaluate if current custom implementation is better

---

### 4. HTTP/2 Server Push

**What it is**: HTTP/2 feature allowing server to push resources proactively.

**Implementation Example**:
```javascript
// Server-side (requires HTTP/2)
app.get('/api/v1/stream', (req, res) => {
  // HTTP/2 push
  res.push('/api/v1/stream/chunk1', {
    ':status': 200,
    'content-type': 'application/json'
  });
  
  res.push('/api/v1/stream/chunk2', {
    ':status': 200,
    'content-type': 'application/json'
  });
});
```

**Pros**:
- ✅ Built into HTTP/2
- ✅ Can reduce latency for anticipated data

**Cons**:
- ❌ Limited browser support
- ❌ Complex to implement
- ❌ Not suitable for dynamic streaming
- ❌ Requires HTTP/2 server setup

**Best For**:
- Static resource preloading
- Not recommended for dynamic streaming

---

### 5. gRPC-Web Streaming

**What it is**: RPC framework with streaming support, compiled to Web.

**Implementation Example**:
```javascript
// Requires protobuf definitions and code generation
const client = new ChatServiceClient('https://api.example.com');

// Client streaming
const stream = client.sendMessage();
stream.write({ message: 'Hello' });
stream.write({ message: 'World' });
stream.end();

// Server streaming
const call = client.receiveMessages({ conversationId });
call.on('data', (message) => {
  // Handle message
});
```

**Pros**:
- ✅ Type-safe with Protocol Buffers
- ✅ Efficient binary protocol
- ✅ Supports bidirectional streaming
- ✅ Language agnostic

**Cons**:
- ❌ Requires code generation
- ❌ More complex setup
- ❌ Additional dependencies
- ❌ May require proxy for browser support
- ❌ Overkill for most web apps

**Best For**:
- Microservices communication
- High-performance requirements
- Multi-language backend

---

### 6. WebRTC Data Channels

**What it is**: Peer-to-peer data channels for low-latency communication.

**Implementation Example**:
```javascript
// Requires signaling server (can use Socket.io)
const pc = new RTCPeerConnection();
const dataChannel = pc.createDataChannel('chat');

dataChannel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle streaming data
};

dataChannel.send(JSON.stringify({ message: 'Hello' }));
```

**Pros**:
- ✅ Very low latency
- ✅ Peer-to-peer (reduces server load)
- ✅ Can handle large data transfers

**Cons**:
- ❌ Complex setup (signaling, STUN/TURN servers)
- ❌ Not suitable for client-server architecture
- ❌ NAT traversal issues
- ❌ Overkill for most use cases

**Best For**:
- Real-time collaboration (peer-to-peer)
- Video/audio streaming
- Gaming applications

---

## Recommended Approaches by Feature

### AI Chat Streaming
**Primary Recommendation**: **Server-Sent Events (SSE)**
- Simpler than WebSockets for one-way streaming
- Better than current fetch approach
- Automatic reconnection
- Works with existing auth

**Alternative**: **WebSockets (Socket.io)**
- If you need bidirectional communication
- Already partially implemented
- Better for interactive features

### Real-Time Task Updates
**Recommendation**: **WebSockets (Socket.io)**
- Already implemented for notifications
- Extend to task updates
- Supports multiple clients

### File Upload/Download Streaming
**Recommendation**: **Fetch API with ReadableStream**
- Current approach is fine
- Can add progress tracking
- Works well for file operations

### Live Collaboration
**Recommendation**: **WebSockets (Socket.io)**
- Full-duplex needed
- Low latency required
- Already have infrastructure

---

## Implementation Roadmap

### Phase 1: Enhance Current Implementation
1. Add reconnection logic to fetch-based streaming
2. Improve error handling
3. Add progress tracking

### Phase 2: Migrate to SSE
1. Replace fetch streaming with EventSource
2. Update backend to send SSE format
3. Add custom event types for tool calls

### Phase 3: Extend WebSockets
1. Add AI chat streaming via Socket.io
2. Implement room-based isolation
3. Add message queuing

### Phase 4: Evaluate Vercel AI SDK
1. Test with Next.js API routes
2. Compare performance with custom implementation
3. Decide on migration path

---

## Code Examples

### Example 1: SSE Implementation for AI Chat

```javascript
// src/hooks/ai/useSSEAIChat.js
"use client";
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useSSEAIChat = (conversationId) => {
  const { getToken } = useAuth();
  const eventSourceRef = useRef(null);
  const [status, setStatus] = useState('idle');

  const sendMessage = async (message, model, settings) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = await getToken();
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${conversationId}/stream?message=${encodeURIComponent(message)}&model=${model}`,
      {
        headers: {
          Authorization: token
        }
      }
    );

    eventSource.onopen = () => {
      setStatus('streaming');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle message chunk
    };

    eventSource.addEventListener('tool-call', (event) => {
      const toolCall = JSON.parse(event.data);
      // Handle tool call
    });

    eventSource.addEventListener('complete', () => {
      setStatus('idle');
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setStatus('error');
      eventSource.close();
    };

    eventSourceRef.current = eventSource;
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return { sendMessage, status };
};
```

### Example 2: WebSocket Streaming for AI Chat

```javascript
// src/hooks/ai/useWebSocketAIChat.js
"use client";
import { useEffect } from 'react';
import useSocketStore from '@/lib/sockets/SocketStore';

export const useWebSocketAIChat = (conversationId, onChunk, onComplete) => {
  const socket = useSocketStore((state) => state.socket);

  const sendMessage = (message, model, settings) => {
    if (!socket) return;

    socket.emit('ai-chat:send', {
      conversationId,
      message,
      model,
      settings
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleChunk = (chunk) => {
      onChunk(chunk);
    };

    const handleComplete = (data) => {
      onComplete(data);
    };

    socket.on('ai-chat:chunk', handleChunk);
    socket.on('ai-chat:complete', handleComplete);

    return () => {
      socket.off('ai-chat:chunk', handleChunk);
      socket.off('ai-chat:complete', handleComplete);
    };
  }, [socket, onChunk, onComplete]);

  return { sendMessage };
};
```

### Example 3: Enhanced Fetch Streaming with AbortController

```javascript
// src/hooks/ai/useEnhancedStreaming.js
"use client";
import { useRef } from 'react';

export const useEnhancedStreaming = () => {
  const abortControllerRef = useRef(null);

  const streamWithAbort = async (url, options, onChunk, onComplete) => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }

      onComplete();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        throw error;
      }
    }
  };

  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { streamWithAbort, abort };
};
```

---

## Performance Considerations

### Latency Comparison
1. **WebSockets**: ~1-5ms (lowest)
2. **SSE**: ~5-10ms
3. **Fetch Streaming**: ~10-20ms
4. **Polling**: ~100-1000ms

### Resource Usage
- **WebSockets**: Higher (persistent connections)
- **SSE**: Medium (persistent connections, but simpler)
- **Fetch**: Lower (request/response cycle)

### Scalability
- **WebSockets**: Requires connection management, can scale with Redis adapter
- **SSE**: Simpler, but still requires connection management
- **Fetch**: Stateless, easier to scale horizontally

---

## Security Considerations

### Authentication
- **SSE**: Can use query params or headers (EventSource limitation)
- **WebSockets**: Can use auth during handshake
- **Fetch**: Standard headers work

### CORS
- All approaches need proper CORS configuration
- WebSockets may need special handling

### Rate Limiting
- WebSockets: Per-connection limits
- SSE: Per-connection limits
- Fetch: Per-request limits (easier to implement)

---

## Testing Strategies

### Unit Tests
- Mock EventSource for SSE
- Mock Socket.io for WebSockets
- Mock fetch for streaming

### Integration Tests
- Test reconnection logic
- Test error handling
- Test message ordering

### Load Tests
- Connection limits
- Memory usage
- CPU usage under load

---

## Next Steps

1. **Evaluate current needs**: Which features require streaming?
2. **Choose primary approach**: SSE vs WebSockets vs Enhanced Fetch
3. **Create proof of concept**: Implement one feature with chosen approach
4. **Measure performance**: Compare with current implementation
5. **Plan migration**: Gradual migration strategy
6. **Document patterns**: Create reusable streaming utilities

---

## References

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Fetch API Streaming](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#processing_a_text_file_line_by_line)
