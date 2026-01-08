import { ExecutionEvent, WebSocketMessage } from "@/lib/types/execution";

type EventCallback = (event: ExecutionEvent) => void;

export class ExecutionWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private callbacks: Set<EventCallback> = new Set();
  private shouldReconnect = true;

  constructor(url: string = "ws://localhost:3000") {
    this.url = url;
  }

  connect(executionId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.shouldReconnect = true;
    const wsUrl = `${this.url}/executions/${executionId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const execEvent = message.payload as ExecutionEvent;
        this.callbacks.forEach((callback) => callback(execEvent));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket closed");
      if (
        this.shouldReconnect &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        const delay =
          this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(
          `Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`
        );
        setTimeout(() => this.connect(executionId), delay);
      }
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(callback: EventCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
