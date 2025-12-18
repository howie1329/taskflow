/**
 * WebSocket Streaming Utility for AI Chat and Real-time Features
 * 
 * Extends the existing Socket.io implementation with streaming-specific
 * functionality for AI chat, file uploads, and other streaming use cases.
 * 
 * Usage:
 * ```javascript
 * const streamer = useWebSocketStreaming({
 *   namespace: 'ai-chat',
 *   conversationId: 'conv-123',
 *   onChunk: (chunk) => updateMessage(chunk),
 *   onComplete: (final) => handleComplete(final),
 *   onError: (error) => handleError(error)
 * });
 * 
 * streamer.sendMessage('Hello AI', { model: 'gpt-4' });
 * streamer.abort(); // Cancel streaming
 * ```
 */

import { useEffect, useRef, useState } from 'react';
import useSocketStore from '@/lib/sockets/SocketStore';

export class WebSocketStreamer {
  constructor(socket, options = {}) {
    const {
      namespace,
      conversationId,
      onChunk,
      onComplete,
      onError,
      onToolCall,
      onStatusChange,
    } = options;

    this.socket = socket;
    this.namespace = namespace || 'default';
    this.conversationId = conversationId;
    this.onChunk = onChunk || (() => {});
    this.onComplete = onComplete || (() => {});
    this.onError = onError || (() => {});
    this.onToolCall = onToolCall || (() => {});
    this.onStatusChange = onStatusChange || (() => {});

    this.isStreaming = false;
    this.currentStreamId = null;
    this.listeners = [];

    this.setupListeners();
  }

  /**
   * Setup Socket.io event listeners
   */
  setupListeners() {
    if (!this.socket) return;

    const eventPrefix = `${this.namespace}:`;

    // Stream chunk received
    const chunkHandler = (data) => {
      if (data.streamId === this.currentStreamId) {
        this.onChunk(data);
      }
    };

    // Stream complete
    const completeHandler = (data) => {
      if (data.streamId === this.currentStreamId) {
        this.isStreaming = false;
        this.currentStreamId = null;
        this.onStatusChange('idle');
        this.onComplete(data);
      }
    };

    // Tool call event
    const toolCallHandler = (data) => {
      if (data.streamId === this.currentStreamId) {
        this.onToolCall(data);
      }
    };

    // Error event
    const errorHandler = (error) => {
      this.isStreaming = false;
      this.currentStreamId = null;
      this.onStatusChange('error');
      this.onError(error);
    };

    // Status update
    const statusHandler = (data) => {
      if (data.streamId === this.currentStreamId) {
        this.onStatusChange(data.status);
      }
    };

    this.socket.on(`${eventPrefix}chunk`, chunkHandler);
    this.socket.on(`${eventPrefix}complete`, completeHandler);
    this.socket.on(`${eventPrefix}tool-call`, toolCallHandler);
    this.socket.on(`${eventPrefix}error`, errorHandler);
    this.socket.on(`${eventPrefix}status`, statusHandler);

    // Store listeners for cleanup
    this.listeners = [
      { event: `${eventPrefix}chunk`, handler: chunkHandler },
      { event: `${eventPrefix}complete`, handler: completeHandler },
      { event: `${eventPrefix}tool-call`, handler: toolCallHandler },
      { event: `${eventPrefix}error`, handler: errorHandler },
      { event: `${eventPrefix}status`, handler: statusHandler },
    ];
  }

  /**
   * Send message and start streaming
   */
  sendMessage(message, options = {}) {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Socket not connected');
    }

    if (this.isStreaming) {
      console.warn('Already streaming, aborting previous stream');
      this.abort();
    }

    const streamId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentStreamId = streamId;
    this.isStreaming = true;
    this.onStatusChange('streaming');

    this.socket.emit(`${this.namespace}:send`, {
      streamId,
      conversationId: this.conversationId,
      message,
      ...options,
    });

    return streamId;
  }

  /**
   * Abort current stream
   */
  abort() {
    if (!this.socket || !this.currentStreamId) {
      return;
    }

    this.socket.emit(`${this.namespace}:abort`, {
      streamId: this.currentStreamId,
      conversationId: this.conversationId,
    });

    this.isStreaming = false;
    this.currentStreamId = null;
    this.onStatusChange('idle');
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (!this.socket) return;

    this.listeners.forEach(({ event, handler }) => {
      this.socket.off(event, handler);
    });

    this.listeners = [];
    this.isStreaming = false;
    this.currentStreamId = null;
  }

  /**
   * Update conversation ID
   */
  setConversationId(conversationId) {
    this.conversationId = conversationId;
  }
}

/**
 * React hook for WebSocket streaming
 */
export function useWebSocketStreaming(options = {}) {
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);
  const streamerRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const streamer = new WebSocketStreamer(socket, {
      ...options,
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        options.onStatusChange?.(newStatus);
      },
      onError: (err) => {
        setError(err);
        options.onError?.(err);
      },
    });

    streamerRef.current = streamer;

    return () => {
      streamer.cleanup();
    };
  }, [socket, isConnected, options.namespace, options.conversationId]);

  const sendMessage = (message, streamOptions = {}) => {
    if (streamerRef.current) {
      return streamerRef.current.sendMessage(message, streamOptions);
    }
  };

  const abort = () => {
    if (streamerRef.current) {
      streamerRef.current.abort();
    }
  };

  return {
    sendMessage,
    abort,
    status,
    error,
    isConnected,
    isStreaming: status === 'streaming',
  };
}

/**
 * Hook specifically for AI Chat streaming
 */
export function useAIChatStreaming(conversationId, callbacks = {}) {
  const {
    onChunk,
    onComplete,
    onToolCall,
    onError,
  } = callbacks;

  return useWebSocketStreaming({
    namespace: 'ai-chat',
    conversationId,
    onChunk: (data) => {
      // Handle different chunk types
      if (data.type === 'text') {
        onChunk?.(data);
      } else if (data.type === 'tool-call') {
        onToolCall?.(data);
      }
    },
    onComplete,
    onError,
  });
}
