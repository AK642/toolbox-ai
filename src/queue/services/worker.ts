import { QueueService } from './queue.service';
import { AIGatewayService } from '../../gateway/services/ai-gateway.service';
import { SocketService } from '../../socket/services/socket.service';
import { createServer } from 'http';
import { App } from '../../app';

const queueService = QueueService.getInstance();
const gatewayService = AIGatewayService.getInstance();

// Setup HTTP server and SocketService
const app = new App();
const httpServer = createServer(app.express);
const socketService = SocketService.getInstance();
socketService.initialize(httpServer);

// Start HTTP server on a different port for the worker (optional, e.g., 5011)
const WORKER_PORT = process.env.WORKER_PORT ? parseInt(process.env.WORKER_PORT, 10) : 5011;
httpServer.listen(WORKER_PORT, () => {
  console.log(`Worker HTTP/Socket server running on port ${WORKER_PORT}`);
});

async function startConsumer() {
  await queueService.consumeMessages('ai_requests', async (queueMessage) => {
    const payload = queueMessage.payload as any;
    const { userId, toolId, message, sessionId, requestId } = payload;

    // 1. Notify user: request is being executed
    socketService.emitToUser(userId, 'notification', {
      type: 'info',
      title: 'AI Request Started',
      message: 'Your AI request is being processed.',
      data: { requestId, toolId }
    });

    // 2. Call the AI tool
    let response: string = '';
    let success = true;
    let error: string | undefined;
    let duration = 0;
    const start = Date.now();
    try {
      const gatewayResp = await gatewayService.callAITool(toolId, message, userId);
      response = gatewayResp.data;
      duration = gatewayResp.duration;
    } catch (err: any) {
      response = '';
      success = false;
      error = err.message || 'Unknown error';
      duration = Date.now() - start;
    }

    // 3. Send AI response to user via socket
    socketService.emitToUser(userId, 'ai_response', {
      requestId,
      response,
      success,
      error,
      duration,
      toolId,
      userId
    });

    // 4. Notify user: request completed
    socketService.emitToUser(userId, 'notification', {
      type: success ? 'success' : 'error',
      title: 'AI Request Completed',
      message: success ? 'Your AI request has been processed.' : `Error: ${error}`,
      data: { requestId, toolId }
    });
  });
}

startConsumer().catch((err) => {
  console.error('Failed to start queue consumer:', err);
  process.exit(1);
}); 