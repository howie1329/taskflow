/**
 * Streaming Utilities Index
 * 
 * Central export point for all streaming utilities.
 * Provides a unified interface for different streaming approaches.
 */

export { SSEClient, useSSE } from './sseClient';
export {
  WebSocketStreamer,
  useWebSocketStreaming,
  useAIChatStreaming,
} from './websocketStreaming';
export {
  EnhancedFetchStreamer,
  useEnhancedFetchStreaming,
} from './enhancedFetchStreaming';

/**
 * Streaming utility factory
 * Creates the appropriate streaming client based on type
 */
export function createStreamer(type, options) {
  switch (type) {
    case 'sse':
      return new (require('./sseClient').SSEClient)(options);
    case 'websocket':
      return new (require('./websocketStreaming').WebSocketStreamer)(
        options.socket,
        options
      );
    case 'fetch':
    default:
      return new (require('./enhancedFetchStreaming').EnhancedFetchStreamer)(
        options
      );
  }
}

/**
 * Determine best streaming approach based on requirements
 */
export function getRecommendedStreamingType(requirements = {}) {
  const {
    bidirectional = false,
    lowLatency = false,
    simple = true,
    alreadyUsingWebSockets = false,
  } = requirements;

  if (alreadyUsingWebSockets && (bidirectional || lowLatency)) {
    return 'websocket';
  }

  if (bidirectional) {
    return 'websocket';
  }

  if (simple && !lowLatency) {
    return 'sse';
  }

  return 'fetch';
}
