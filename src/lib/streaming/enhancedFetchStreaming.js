/**
 * Enhanced Fetch Streaming Utility
 * 
 * Improves the current fetch-based streaming implementation with:
 * - AbortController support
 * - Better error handling
 * - Progress tracking
 * - Automatic reconnection
 * - Chunk buffering
 * 
 * Usage:
 * ```javascript
 * const streamer = new EnhancedFetchStreamer({
 *   url: '/api/v1/stream',
 *   getAuthToken: async () => await getToken(),
 *   onChunk: (chunk) => handleChunk(chunk),
 *   onComplete: () => handleComplete(),
 *   onError: (error) => handleError(error)
 * });
 * 
 * await streamer.start({ message: 'Hello' });
 * streamer.abort(); // Cancel if needed
 * ```
 */

export class EnhancedFetchStreamer {
  constructor(options = {}) {
    const {
      url,
      getAuthToken,
      onChunk,
      onComplete,
      onError,
      onProgress,
      parser = 'custom', // 'custom', 'json', 'text', 'sse'
      retryOnError = false,
      maxRetries = 3,
    } = options;

    this.url = url;
    this.getAuthToken = getAuthToken;
    this.onChunk = onChunk || (() => {});
    this.onComplete = onComplete || (() => {});
    this.onError = onError || (() => {});
    this.onProgress = onProgress || (() => {});
    this.parser = parser;
    this.retryOnError = retryOnError;
    this.maxRetries = maxRetries;

    this.abortController = null;
    this.reader = null;
    this.isStreaming = false;
    this.bytesReceived = 0;
    this.chunksReceived = 0;
  }

  /**
   * Start streaming
   */
  async start(data = {}, options = {}) {
    // Abort previous stream if exists
    if (this.abortController) {
      this.abort();
    }

    this.abortController = new AbortController();
    this.isStreaming = true;
    this.bytesReceived = 0;
    this.chunksReceived = 0;

    let retryCount = 0;

    while (retryCount <= this.maxRetries) {
      try {
        await this.executeStream(data, options);
        break; // Success, exit retry loop
      } catch (error) {
        if (error.name === 'AbortError') {
          // User aborted, don't retry
          return;
        }

        retryCount++;
        if (retryCount > this.maxRetries || !this.retryOnError) {
          this.isStreaming = false;
          this.onError(error);
          throw error;
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
      }
    }
  }

  /**
   * Execute the streaming request
   */
  async executeStream(data, options) {
    const token = this.getAuthToken ? await this.getAuthToken() : null;

    const response = await fetch(this.url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
        ...options.headers,
      },
      body: JSON.stringify(data),
      signal: this.abortController.signal,
      ...options.fetchOptions,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    this.reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      await this.processStream(decoder);
      this.isStreaming = false;
      this.onComplete();
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    } finally {
      if (this.reader) {
        try {
          await this.reader.cancel();
        } catch (e) {
          // Ignore cancel errors
        }
      }
    }
  }

  /**
   * Process the stream based on parser type
   */
  async processStream(decoder) {
    switch (this.parser) {
      case 'json':
        return await this.processJSONStream(decoder);
      case 'sse':
        return await this.processSSEStream(decoder);
      case 'text':
        return await this.processTextStream(decoder);
      case 'custom':
      default:
        return await this.processCustomStream(decoder);
    }
  }

  /**
   * Process custom protocol (current implementation)
   */
  async processCustomStream(decoder) {
    let buffer = '';

    while (true) {
      const { done, value } = await this.reader.read();

      if (done) break;

      this.bytesReceived += value.length;
      this.chunksReceived++;
      this.onProgress({
        bytesReceived: this.bytesReceived,
        chunksReceived: this.chunksReceived,
      });

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          await this.parseCustomChunk(line);
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      await this.parseCustomChunk(buffer);
    }
  }

  /**
   * Parse custom protocol chunk (matches current StreamingUtils.js format)
   */
  async parseCustomChunk(chunk) {
    if (chunk.startsWith('json:')) {
      const jsonStr = chunk.replace('json:', '').trim();
      try {
        const data = JSON.parse(jsonStr);
        this.onChunk({ type: 'json', data });
      } catch (e) {
        console.error('Failed to parse JSON chunk:', e);
      }
    } else if (chunk.startsWith('ToolCallStart:')) {
      const jsonStr = chunk.replace('ToolCallStart:', '').trim();
      try {
        const data = JSON.parse(jsonStr);
        this.onChunk({ type: 'tool-call-start', data });
      } catch (e) {
        console.error('Failed to parse tool call start:', e);
      }
    } else if (chunk.startsWith('ToolCallEnd:')) {
      const jsonStr = chunk.replace('ToolCallEnd:', '').trim();
      try {
        const data = JSON.parse(jsonStr);
        this.onChunk({ type: 'tool-call-end', data });
      } catch (e) {
        console.error('Failed to parse tool call end:', e);
      }
    } else if (chunk.startsWith('text:')) {
      const jsonStr = chunk.replace('text:', '').trim();
      try {
        const data = JSON.parse(jsonStr);
        this.onChunk({ type: 'text', data });
      } catch (e) {
        console.error('Failed to parse text chunk:', e);
      }
    } else {
      // Raw text chunk
      this.onChunk({ type: 'raw', data: chunk });
    }
  }

  /**
   * Process JSON stream (newline-delimited JSON)
   */
  async processJSONStream(decoder) {
    let buffer = '';

    while (true) {
      const { done, value } = await this.reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            this.onChunk({ type: 'json', data });
          } catch (e) {
            console.error('Failed to parse JSON line:', e);
          }
        }
      }
    }
  }

  /**
   * Process SSE format stream
   */
  async processSSEStream(decoder) {
    let buffer = '';

    while (true) {
      const { done, value } = await this.reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const lines = event.split('\n');
        const eventData = {};

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventData.event = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            try {
              eventData.data = JSON.parse(data);
            } catch {
              eventData.data = data;
            }
          } else if (line.startsWith('id:')) {
            eventData.id = line.substring(3).trim();
          }
        }

        if (eventData.data) {
          this.onChunk(eventData);
        }
      }
    }
  }

  /**
   * Process plain text stream
   */
  async processTextStream(decoder) {
    while (true) {
      const { done, value } = await this.reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      this.onChunk({ type: 'text', data: chunk });
    }
  }

  /**
   * Abort the current stream
   */
  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.reader) {
      this.reader.cancel().catch(() => {
        // Ignore cancel errors
      });
      this.reader = null;
    }

    this.isStreaming = false;
  }

  /**
   * Get streaming status
   */
  getStatus() {
    return {
      isStreaming: this.isStreaming,
      bytesReceived: this.bytesReceived,
      chunksReceived: this.chunksReceived,
    };
  }
}

/**
 * React hook for enhanced fetch streaming
 */
export function useEnhancedFetchStreaming(options) {
  const { useEffect, useRef, useState } = require('react');

  const streamerRef = useRef(null);
  const [status, setStatus] = useState({
    isStreaming: false,
    bytesReceived: 0,
    chunksReceived: 0,
    error: null,
  });

  useEffect(() => {
    const streamer = new EnhancedFetchStreamer({
      ...options,
      onProgress: (progress) => {
        setStatus((prev) => ({
          ...prev,
          bytesReceived: progress.bytesReceived,
          chunksReceived: progress.chunksReceived,
        }));
        options.onProgress?.(progress);
      },
      onComplete: () => {
        setStatus((prev) => ({ ...prev, isStreaming: false }));
        options.onComplete?.();
      },
      onError: (error) => {
        setStatus((prev) => ({ ...prev, isStreaming: false, error }));
        options.onError?.(error);
      },
    });

    streamerRef.current = streamer;

    return () => {
      streamer.abort();
    };
  }, [options.url]);

  const start = async (data, streamOptions) => {
    if (streamerRef.current) {
      setStatus((prev) => ({ ...prev, isStreaming: true, error: null }));
      return await streamerRef.current.start(data, streamOptions);
    }
  };

  const abort = () => {
    if (streamerRef.current) {
      streamerRef.current.abort();
      setStatus((prev) => ({ ...prev, isStreaming: false }));
    }
  };

  return {
    start,
    abort,
    status,
    streamer: streamerRef.current,
  };
}
