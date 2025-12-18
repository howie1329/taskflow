/**
 * Server-Sent Events (SSE) Client Utility
 * 
 * Provides a clean API for SSE streaming with automatic reconnection,
 * error handling, and event type support.
 * 
 * Usage:
 * ```javascript
 * const sseClient = new SSEClient({
 *   url: '/api/v1/stream',
 *   getAuthToken: async () => await getToken(),
 *   onMessage: (data) => console.log('Message:', data),
 *   onError: (error) => console.error('Error:', error)
 * });
 * 
 * sseClient.connect();
 * sseClient.send({ type: 'message', data: 'Hello' }); // If bidirectional needed
 * sseClient.close();
 * ```
 */

export class SSEClient {
  constructor(options = {}) {
    const {
      url,
      getAuthToken,
      onMessage,
      onError,
      onOpen,
      onClose,
      retryDelay = 1000,
      maxRetries = 5,
      customEvents = {},
    } = options;

    this.url = url;
    this.getAuthToken = getAuthToken;
    this.onMessage = onMessage || (() => {});
    this.onError = onError || (() => {});
    this.onOpen = onOpen || (() => {});
    this.onClose = onClose || (() => {});
    this.retryDelay = retryDelay;
    this.maxRetries = maxRetries;
    this.customEvents = customEvents;

    this.eventSource = null;
    this.retryCount = 0;
    this.isConnecting = false;
    this.isConnected = false;
    this.shouldReconnect = true;
  }

  /**
   * Connect to the SSE endpoint
   */
  async connect() {
    if (this.isConnecting || this.isConnected) {
      console.warn('SSE client already connecting or connected');
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const token = this.getAuthToken ? await this.getAuthToken() : null;
      const urlWithAuth = this.buildUrlWithAuth(token);

      // Note: EventSource doesn't support custom headers in browsers
      // So we need to pass auth via query params or use a proxy endpoint
      this.eventSource = new EventSource(urlWithAuth);

      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error);
      this.scheduleReconnect();
    }
  }

  /**
   * Build URL with authentication token
   * Since EventSource doesn't support custom headers, we use query params
   */
  buildUrlWithAuth(token) {
    const url = new URL(this.url, window.location.origin);
    if (token) {
      url.searchParams.set('token', token);
    }
    return url.toString();
  }

  /**
   * Setup event handlers for EventSource
   */
  setupEventHandlers() {
    if (!this.eventSource) return;

    // Standard message event
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        // If not JSON, pass raw data
        this.onMessage(event.data);
      }
    };

    // Custom event types
    Object.keys(this.customEvents).forEach((eventType) => {
      this.eventSource.addEventListener(eventType, (event) => {
        try {
          const data = JSON.parse(event.data);
          this.customEvents[eventType](data, event);
        } catch (error) {
          this.customEvents[eventType](event.data, event);
        }
      });
    });

    // Connection opened
    this.eventSource.onopen = () => {
      this.isConnecting = false;
      this.isConnected = true;
      this.retryCount = 0;
      this.onOpen();
    };

    // Error handling
    this.eventSource.onerror = (error) => {
      this.isConnecting = false;
      this.isConnected = false;

      if (this.eventSource.readyState === EventSource.CLOSED) {
        this.handleError(new Error('SSE connection closed'));
        if (this.shouldReconnect && this.retryCount < this.maxRetries) {
          this.scheduleReconnect();
        } else {
          this.onClose();
        }
      } else {
        // Connection is still open, might be a temporary error
        this.handleError(error);
      }
    };
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (!this.shouldReconnect || this.retryCount >= this.maxRetries) {
      return;
    }

    this.retryCount++;
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('SSE Client Error:', error);
    this.onError(error);
  }

  /**
   * Close the connection
   */
  close() {
    this.shouldReconnect = false;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.onClose();
  }

  /**
   * Send data to server (requires separate HTTP request since SSE is one-way)
   * This is a helper method - SSE itself doesn't support sending
   */
  async send(data) {
    // SSE is one-way, so we need to use fetch for sending
    // This is a convenience method that assumes the server has a separate endpoint
    const token = this.getAuthToken ? await this.getAuthToken() : null;
    const sendUrl = this.url.replace('/stream', '/send'); // Adjust based on your API

    try {
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to send: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      retryCount: this.retryCount,
      readyState: this.eventSource?.readyState,
    };
  }
}

/**
 * Hook for React components
 */
export function useSSE(options) {
  const { useEffect, useRef, useState } = require('react');

  const clientRef = useRef(null);
  const [status, setStatus] = useState({
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  useEffect(() => {
    const client = new SSEClient({
      ...options,
      onOpen: () => {
        setStatus({ isConnected: true, isConnecting: false, error: null });
        options.onOpen?.();
      },
      onClose: () => {
        setStatus({ isConnected: false, isConnecting: false, error: null });
        options.onClose?.();
      },
      onError: (error) => {
        setStatus((prev) => ({ ...prev, error }));
        options.onError?.(error);
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.close();
    };
  }, [options.url]); // Reconnect if URL changes

  const send = async (data) => {
    if (clientRef.current) {
      return await clientRef.current.send(data);
    }
  };

  const close = () => {
    if (clientRef.current) {
      clientRef.current.close();
    }
  };

  return {
    send,
    close,
    status,
    client: clientRef.current,
  };
}
