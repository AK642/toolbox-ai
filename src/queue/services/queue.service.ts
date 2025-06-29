import { v4 as uuidv4 } from 'uuid';
import { QueueConfigManager } from '../config/queue.config';
import { 
  QueueMessage, 
  AIRequestMessage, 
  AIResponseMessage, 
  NotificationMessage, 
  StatusUpdateMessage,
  QueueStats,
  QueueHealth
} from '../types/queue.types';

export class QueueService {
  private static instance: QueueService;
  private configManager: QueueConfigManager;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private stats: QueueStats = {
    totalMessages: 0,
    processedMessages: 0,
    failedMessages: 0,
    pendingMessages: 0,
    averageProcessingTime: 0,
    queueSize: 0
  };
  private health: QueueHealth = {
    status: 'disconnected',
    lastHeartbeat: new Date(),
    connectionErrors: 0,
    messageErrors: 0
  };

  private constructor() {
    this.configManager = QueueConfigManager.getInstance();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  public async connect(): Promise<void> {
    try {
      // TODO: Implement actual RabbitMQ connection
      // For now, just simulate connection
      this.isConnected = true;
      this.health.status = 'connected';
      this.health.lastHeartbeat = new Date();
      this.reconnectAttempts = 0;
      
      console.log('Queue service initialized (RabbitMQ connection pending)');
    } catch (error) {
      this.health.connectionErrors++;
      this.health.status = 'error';
      console.error('Failed to initialize queue service:', error);
      throw error;
    }
  }

  public async publishMessage(message: QueueMessage, queue: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // TODO: Implement actual message publishing to RabbitMQ
      console.log(`Message would be published to ${queue}:`, message);
      
      this.stats.totalMessages++;
      this.stats.pendingMessages++;
      
      return true;
    } catch (error) {
      this.health.messageErrors++;
      console.error('Failed to publish message:', error);
      return false;
    }
  }

  public async publishAIRequest(request: Omit<AIRequestMessage['payload'], 'requestId'>): Promise<string> {
    const requestId = uuidv4();
    const message: AIRequestMessage = {
      id: uuidv4(),
      type: 'ai_request',
      payload: { ...request, requestId },
      timestamp: new Date(),
      userId: request.userId,
      toolId: request.toolId,
      sessionId: request.sessionId
    };

    const success = await this.publishMessage(message, 'ai_requests');
    return success ? requestId : '';
  }

  public async publishAIResponse(response: AIResponseMessage['payload']): Promise<boolean> {
    const message: AIResponseMessage = {
      id: uuidv4(),
      type: 'ai_response',
      payload: response,
      timestamp: new Date(),
      userId: response.userId,
      toolId: response.toolId
    };

    return await this.publishMessage(message, 'ai_responses');
  }

  public async publishNotification(notification: NotificationMessage['payload']): Promise<boolean> {
    const message: NotificationMessage = {
      id: uuidv4(),
      type: 'notification',
      payload: notification,
      timestamp: new Date(),
      userId: notification.userId
    };

    return await this.publishMessage(message, 'notifications');
  }

  public async publishStatusUpdate(status: StatusUpdateMessage['payload']): Promise<boolean> {
    const message: StatusUpdateMessage = {
      id: uuidv4(),
      type: 'status_update',
      payload: status,
      timestamp: new Date(),
      userId: status.userId,
      sessionId: status.sessionId
    };

    return await this.publishMessage(message, 'status_updates');
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public async consumeMessages(
    queue: string, 
    handler: (message: QueueMessage) => Promise<void>
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    // TODO: Implement actual message consumption from RabbitMQ
    console.log(`Would consume messages from ${queue} with handler`);
    
    // Create a mock message for demonstration
    const mockMessage: QueueMessage = {
      id: 'mock-' + Date.now(),
      type: 'notification',
      payload: { userId: 'mock', type: 'info', title: 'Mock', message: 'Mock message' },
      timestamp: new Date(),
      userId: 'mock'
    };
    
    // Call handler with mock message
    await handler(mockMessage);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  public getStats(): QueueStats {
    return { ...this.stats };
  }

  public getHealth(): QueueHealth {
    return { ...this.health };
  }

  public async disconnect(): Promise<void> {
    try {
      this.isConnected = false;
      this.health.status = 'disconnected';
      console.log('Queue service disconnected');
    } catch (error) {
      console.error('Error disconnecting queue service:', error);
    }
  }

  public isQueueConnected(): boolean {
    return this.isConnected;
  }
} 