/**
 * WebSocket client wrapper with reconnection and subscription management.
 */

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WebSocketMessage {
  type: string;
  payload?: unknown;
}

export interface WebSocketClientOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<
    Omit<
      WebSocketClientOptions,
      "onOpen" | "onClose" | "onError" | "onMessage" | "onStatusChange"
    >
  > &
    Pick<
      WebSocketClientOptions,
      "onOpen" | "onClose" | "onError" | "onMessage" | "onStatusChange"
    >;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private status: WebSocketStatus = "disconnected";
  private subscriptions: Set<string> = new Set();

  constructor(options: WebSocketClientOptions) {
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options,
    };
  }

  /**
   * Connect to the WebSocket server.
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setStatus("connecting");

    try {
      // Add auth token to URL if available
      const token = localStorage.getItem("accessToken");
      const url = token
        ? `${this.options.url}?token=${encodeURIComponent(token)}`
        : this.options.url;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus("connected");
        this.options.onOpen?.();

        // Resubscribe to any active subscriptions
        this.subscriptions.forEach((id) => {
          this.send({ type: "SUBSCRIBE_RUN", payload: { runId: id } });
        });
      };

      this.ws.onclose = () => {
        this.setStatus("disconnected");
        this.options.onClose?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        this.setStatus("error");
        this.options.onError?.(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.options.onMessage?.(message);
        } catch {
          console.error("Failed to parse WebSocket message:", event.data);
        }
      };
    } catch (error) {
      this.setStatus("error");
      console.error("Failed to create WebSocket connection:", error);
    }
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    this.clearReconnectTimeout();
    this.subscriptions.clear();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus("disconnected");
  }

  /**
   * Send a message to the server.
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
    }
  }

  /**
   * Subscribe to run updates.
   */
  subscribeToRun(runId: string): void {
    this.subscriptions.add(runId);
    this.send({ type: "SUBSCRIBE_RUN", payload: { runId } });
  }

  /**
   * Unsubscribe from run updates.
   */
  unsubscribeFromRun(runId: string): void {
    this.subscriptions.delete(runId);
    this.send({ type: "UNSUBSCRIBE_RUN", payload: { runId } });
  }

  /**
   * Get current connection status.
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if connected.
   */
  isConnected(): boolean {
    return this.status === "connected";
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  private attemptReconnect(): void {
    if (!this.options.reconnect) return;
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached");
      return;
    }

    this.clearReconnectTimeout();
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`,
      );
      this.connect();
    }, this.options.reconnectInterval);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

/**
 * Create a WebSocket client instance for the app.
 */
export function createWebSocketClient(
  baseUrl: string,
  handlers?: Partial<
    Pick<WebSocketClientOptions, "onMessage" | "onStatusChange">
  >,
): WebSocketClient {
  // Convert HTTP URL to WebSocket URL
  const wsUrl = baseUrl.replace(/^http/, "ws") + "/ws";

  return new WebSocketClient({
    url: wsUrl,
    ...handlers,
  });
}
