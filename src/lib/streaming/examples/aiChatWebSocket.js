/**
 * Example: AI Chat using WebSockets (Socket.io)
 * 
 * This example shows how to use WebSockets for bidirectional
 * AI chat streaming, extending the existing Socket.io setup.
 */

"use client";
import { useAIChatStreaming } from '../websocketStreaming';
import { useQueryClient } from '@tanstack/react-query';

export function useAIChatWebSocket(conversationId) {
  const queryClient = useQueryClient();

  const { sendMessage, abort, status, isStreaming } = useAIChatStreaming(
    conversationId,
    {
      onChunk: (chunk) => {
        // Handle streaming chunk
        if (chunk.type === 'text') {
          queryClient.setQueryData(['messages', conversationId], (old) => {
            if (!old) return [];
            const messages = [...old];
            const lastMessage = messages[messages.length - 1];
            
            if (lastMessage?.id === chunk.messageId && lastMessage?.role === 'assistant') {
              lastMessage.content += chunk.text;
              return messages;
            }
            
            return [...messages, {
              id: chunk.messageId,
              role: 'assistant',
              content: chunk.text,
            }];
          });
        }
      },
      onToolCall: (toolCall) => {
        // Handle tool call
        queryClient.setQueryData(['messages', conversationId], (old) => {
          if (!old) return [];
          return [...old, {
            id: toolCall.call_id,
            role: 'tool',
            content: `${toolCall.name} has started`,
            status: 'started',
            toolName: toolCall.name,
            input: toolCall.input,
          }];
        });
      },
      onComplete: (finalMessage) => {
        // Handle completion
        queryClient.setQueryData(['messages', conversationId], (old) => {
          if (!old) return [];
          const messages = [...old];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage?.id === finalMessage.id) {
            return messages.map(msg => 
              msg.id === finalMessage.id 
                ? { ...msg, ...finalMessage, status: 'complete' }
                : msg
            );
          }
          
          return [...messages, finalMessage];
        });
        
        queryClient.invalidateQueries(['conversations']);
      },
      onError: (error) => {
        console.error('WebSocket streaming error:', error);
      },
    }
  );

  const sendAIMessage = (message, model, settings) => {
    return sendMessage(message, {
      model,
      settings,
    });
  };

  return {
    sendMessage: sendAIMessage,
    abort,
    status,
    isStreaming,
  };
}
