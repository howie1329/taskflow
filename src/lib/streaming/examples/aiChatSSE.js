/**
 * Example: AI Chat using Server-Sent Events (SSE)
 * 
 * This example shows how to replace the current fetch-based streaming
 * with SSE for better reconnection handling and simpler implementation.
 */

"use client";
import { useSSE } from '../sseClient';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

export function useAIChatSSE(conversationId) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { send, status } = useSSE({
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${conversationId}/stream`,
    getAuthToken: getToken,
    customEvents: {
      'text-chunk': (data) => {
        // Handle text chunk
        queryClient.setQueryData(['messages', conversationId], (old) => {
          if (!old) return [];
          const messages = [...old];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage?.role === 'assistant') {
            lastMessage.content += data.text;
            return messages;
          }
          
          return [...messages, {
            id: data.id,
            role: 'assistant',
            content: data.text,
          }];
        });
      },
      'tool-call': (data) => {
        // Handle tool call
        queryClient.setQueryData(['messages', conversationId], (old) => {
          if (!old) return [];
          return [...old, {
            id: data.call_id,
            role: 'tool',
            content: `${data.name} has started`,
            status: 'started',
          }];
        });
      },
      'complete': (data) => {
        // Handle completion
        queryClient.invalidateQueries(['conversations']);
      },
    },
    onMessage: (data) => {
      // Handle standard message event
      console.log('SSE Message:', data);
    },
    onError: (error) => {
      console.error('SSE Error:', error);
    },
  });

  const sendMessage = async (message, model, settings) => {
    // Send message via separate HTTP endpoint (SSE is one-way)
    return await send({
      message,
      model,
      settings,
    });
  };

  return {
    sendMessage,
    status,
    isStreaming: status.isConnected && status.isConnected,
  };
}
