/**
 * Streaming Approaches Comparison Example
 * 
 * This file demonstrates all three streaming approaches side-by-side
 * for easy comparison and testing.
 */

"use client";
import { useAIChatSSE } from './aiChatSSE';
import { useAIChatWebSocket } from './aiChatWebSocket';
import { useAIChatEnhancedFetch } from './aiChatEnhancedFetch';

/**
 * Example component showing how to use different streaming approaches
 */
export function StreamingComparisonExample({ conversationId, streamingType = 'fetch' }) {
  // Option 1: Server-Sent Events
  const sseChat = useAIChatSSE(conversationId);
  
  // Option 2: WebSocket
  const wsChat = useAIChatWebSocket(conversationId);
  
  // Option 3: Enhanced Fetch
  const fetchChat = useAIChatEnhancedFetch(conversationId);

  // Select the appropriate chat handler based on type
  const getChatHandler = () => {
    switch (streamingType) {
      case 'sse':
        return sseChat;
      case 'websocket':
        return wsChat;
      case 'fetch':
      default:
        return fetchChat;
    }
  };

  const chatHandler = getChatHandler();

  const handleSendMessage = async (message, model, settings) => {
    try {
      await chatHandler.sendMessage(message, model, settings);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAbort = () => {
    if (chatHandler.abort) {
      chatHandler.abort();
    }
  };

  return {
    sendMessage: handleSendMessage,
    abort: handleAbort,
    status: chatHandler.status,
    isStreaming: chatHandler.isStreaming,
  };
}

/**
 * Performance comparison helper
 */
export async function compareStreamingPerformance(
  conversationId,
  message,
  model,
  settings
) {
  const results = {
    sse: { time: 0, error: null },
    websocket: { time: 0, error: null },
    fetch: { time: 0, error: null },
  };

  // Test SSE
  try {
    const sseStart = performance.now();
    const sseChat = useAIChatSSE(conversationId);
    await sseChat.sendMessage(message, model, settings);
    results.sse.time = performance.now() - sseStart;
  } catch (error) {
    results.sse.error = error.message;
  }

  // Test WebSocket
  try {
    const wsStart = performance.now();
    const wsChat = useAIChatWebSocket(conversationId);
    await wsChat.sendMessage(message, model, settings);
    results.websocket.time = performance.now() - wsStart;
  } catch (error) {
    results.websocket.error = error.message;
  }

  // Test Enhanced Fetch
  try {
    const fetchStart = performance.now();
    const fetchChat = useAIChatEnhancedFetch(conversationId);
    await fetchChat.sendMessage(message, model, settings);
    results.fetch.time = performance.now() - fetchStart;
  } catch (error) {
    results.fetch.error = error.message;
  }

  return results;
}

/**
 * Feature comparison matrix
 */
export const STREAMING_FEATURES = {
  sse: {
    bidirectional: false,
    reconnection: true,
    browserSupport: 'excellent',
    complexity: 'low',
    latency: 'medium',
    bestFor: ['AI chat', 'Notifications', 'Progress updates'],
  },
  websocket: {
    bidirectional: true,
    reconnection: true,
    browserSupport: 'excellent',
    complexity: 'medium',
    latency: 'low',
    bestFor: ['AI chat', 'Real-time collaboration', 'Interactive features'],
  },
  fetch: {
    bidirectional: false,
    reconnection: false,
    browserSupport: 'excellent',
    complexity: 'low',
    latency: 'medium',
    bestFor: ['File uploads', 'Simple streaming', 'One-off requests'],
  },
};
