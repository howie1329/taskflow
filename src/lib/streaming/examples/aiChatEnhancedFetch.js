/**
 * Example: AI Chat using Enhanced Fetch Streaming
 * 
 * This example shows how to improve the current fetch-based streaming
 * with better error handling, abort support, and progress tracking.
 */

"use client";
import { useEnhancedFetchStreaming } from '../enhancedFetchStreaming';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

export function useAIChatEnhancedFetch(conversationId) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const messageBufferRef = useRef({});

  const { start, abort, status } = useEnhancedFetchStreaming({
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${conversationId}/messages`,
    getAuthToken: getToken,
    parser: 'custom', // Use custom protocol matching current implementation
    retryOnError: true,
    maxRetries: 3,
    onChunk: (chunk) => {
      // Handle different chunk types
      switch (chunk.type) {
        case 'text':
          handleTextChunk(chunk.data);
          break;
        case 'json':
          handleJsonChunk(chunk.data);
          break;
        case 'tool-call-start':
          handleToolCallStart(chunk.data);
          break;
        case 'tool-call-end':
          handleToolCallEnd(chunk.data);
          break;
        default:
          console.log('Unknown chunk type:', chunk);
      }
    },
    onComplete: () => {
      queryClient.invalidateQueries(['conversations']);
      messageBufferRef.current = {};
    },
    onError: (error) => {
      console.error('Streaming error:', error);
    },
    onProgress: (progress) => {
      // Optional: Show progress indicator
      console.log(`Received ${progress.chunksReceived} chunks, ${progress.bytesReceived} bytes`);
    },
  });

  const handleTextChunk = (data) => {
    queryClient.setQueryData(['messages', conversationId], (old) => {
      if (!old) return [];
      
      const messages = [...old];
      const existingMessage = messages.find(msg => msg.id === data.id);
      
      if (existingMessage && existingMessage.role === 'assistant') {
        existingMessage.content += data.text;
        return messages;
      }
      
      return [...messages, {
        id: data.id,
        role: 'assistant',
        content: data.text,
        metadata: { timestamp: new Date().toISOString() },
      }];
    });
  };

  const handleJsonChunk = (data) => {
    queryClient.setQueryData(['messages', conversationId], (old) => {
      if (!old) return [];
      
      const messages = [...old];
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.role === 'assistant') {
        lastMessage.ui = data.response?.data;
        lastMessage.metadata = data.response?.metadata;
        return messages;
      }
      
      return messages;
    });
  };

  const handleToolCallStart = (data) => {
    queryClient.setQueryData(['messages', conversationId], (old) => {
      if (!old) return [];
      
      const messages = [...old];
      const lastMessage = messages[messages.length - 1];
      
      const toolCallMessage = {
        id: data.call_id,
        content: `${data.name} has started`,
        role: 'tool',
        status: 'started',
        toolName: data.name,
      };
      
      // Insert before last message if it's assistant message
      if (lastMessage?.role === 'assistant') {
        messages.splice(messages.length - 1, 0, toolCallMessage);
      } else {
        messages.push(toolCallMessage);
      }
      
      return messages;
    });
  };

  const handleToolCallEnd = (data) => {
    queryClient.setQueryData(['messages', conversationId], (old) => {
      if (!old) return [];
      
      return old.map(msg => 
        msg.id === data.call_id
          ? { ...msg, status: 'completed', content: `${data.name} has ended` }
          : msg
      );
    });
  };

  const sendMessage = async (message, model, settings) => {
    // Add user message first
    queryClient.setQueryData(['messages', conversationId], (old) => [
      ...(old || []),
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        model,
        settings,
      },
    ]);

    // Add thinking message
    queryClient.setQueryData(['messages', conversationId], (old) => [
      ...(old || []),
      {
        id: 'assistant-thinking',
        role: 'Thinking',
        content: 'Thinking...',
        status: 'thinking',
      },
    ]);

    // Start streaming
    await start({
      message,
      model,
      settings,
    }, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  return {
    sendMessage,
    abort,
    status,
    isStreaming: status.isStreaming,
  };
}
