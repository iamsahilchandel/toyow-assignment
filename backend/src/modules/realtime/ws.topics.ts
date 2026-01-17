import { logger } from '../../shared/logger';

/**
 * Topic manager for WebSocket pub/sub
 */
class TopicManager {
  // Map of runId -> Set of client IDs
  private runSubscriptions = new Map<string, Set<string>>();
  // Map of clientId -> WebSocket connection
  private clients = new Map<string, any>();

  /**
   * Register a client connection
   */
  registerClient(clientId: string, ws: any): void {
    this.clients.set(clientId, ws);
    logger.debug('WS client registered', { clientId });
  }

  /**
   * Unregister a client connection
   */
  unregisterClient(clientId: string): void {
    this.clients.delete(clientId);

    // Remove from all subscriptions
    for (const [runId, subscribers] of this.runSubscriptions) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.runSubscriptions.delete(runId);
      }
    }

    logger.debug('WS client unregistered', { clientId });
  }

  /**
   * Subscribe client to run updates
   */
  subscribeToRun(clientId: string, runId: string): void {
    if (!this.runSubscriptions.has(runId)) {
      this.runSubscriptions.set(runId, new Set());
    }

    this.runSubscriptions.get(runId)!.add(clientId);
    logger.debug('Client subscribed to run', { clientId, runId });
  }

  /**
   * Unsubscribe client from run updates
   */
  unsubscribeFromRun(clientId: string, runId: string): void {
    const subscribers = this.runSubscriptions.get(runId);
    if (subscribers) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.runSubscriptions.delete(runId);
      }
    }
    logger.debug('Client unsubscribed from run', { clientId, runId });
  }

  /**
   * Get all clients subscribed to a run
   */
  getRunSubscribers(runId: string): string[] {
    const subscribers = this.runSubscriptions.get(runId);
    return subscribers ? Array.from(subscribers) : [];
  }

  /**
   * Send message to a specific client
   */
  sendToClient(clientId: string, message: any): boolean {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === 1) {
      // WebSocket.OPEN
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        logger.error('Failed to send WS message', { clientId, error });
      }
    }
    return false;
  }

  /**
   * Broadcast message to all subscribers of a run
   */
  broadcastToRun(runId: string, message: any): number {
    const subscribers = this.getRunSubscribers(runId);
    let sent = 0;

    for (const clientId of subscribers) {
      if (this.sendToClient(clientId, message)) {
        sent++;
      }
    }

    return sent;
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.clients.size;
  }

  /**
   * Get subscription count for a run
   */
  getSubscriptionCount(runId: string): number {
    return this.runSubscriptions.get(runId)?.size || 0;
  }
}

export const topicManager = new TopicManager();
