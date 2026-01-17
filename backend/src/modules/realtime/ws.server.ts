import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { authenticateWS, extractTokenFromUrl } from './ws.auth';
import { handleWSMessage } from './ws.events';
import { topicManager } from './ws.topics';
import { logger } from '../../shared/logger';

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket server
 */
export function initWebSocketServer(server: Server): WebSocketServer {
  wss = new WebSocketServer({
    server,
    path: '/ws',
  });

  wss.on('connection', (ws: WebSocket, req) => {
    // Authenticate connection
    const token = extractTokenFromUrl(req.url || '');
    const auth = authenticateWS(token);

    if (!auth) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    // Generate client ID
    const clientId = uuidv4();

    // Register client
    topicManager.registerClient(clientId, ws);

    logger.info('WebSocket client connected', {
      clientId,
      userId: auth.userId,
    });

    // Handle messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const response = handleWSMessage(clientId, message);

        if (response) {
          ws.send(JSON.stringify(response));
        }
      } catch (error) {
        logger.error('Failed to process WS message', { clientId, error });
        ws.send(
          JSON.stringify({
            event: 'ERROR',
            data: {
              message: 'Invalid message format',
              timestamp: new Date().toISOString(),
            },
          })
        );
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      topicManager.unregisterClient(clientId);
      logger.info('WebSocket client disconnected', { clientId });
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket error', { clientId, error: error.message });
    });

    // Send welcome message
    ws.send(
      JSON.stringify({
        event: 'CONNECTED',
        data: {
          clientId,
          userId: auth.userId,
          timestamp: new Date().toISOString(),
        },
      })
    );
  });

  logger.info('WebSocket server initialized on /ws');

  return wss;
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}

/**
 * Get number of connected clients
 */
export function getConnectionCount(): number {
  return topicManager.getConnectionCount();
}
