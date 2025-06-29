export interface QueueConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  connectionTimeout: number;
  heartbeat: number;
}

export interface QueueMessage {
  id: string;
  type: 'ai_request' | 'ai_response' | 'notification' | 'status_update';
  payload: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  toolId?: string;
  sessionId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  retryCount?: number;
  maxRetries?: number;
}

export interface AIRequestMessage extends QueueMessage {
  type: 'ai_request';
  payload: {
    toolId: string;
    message: string;
    userId: string;
    sessionId: string;
    requestId: string;
  };
}

export interface AIResponseMessage extends QueueMessage {
  type: 'ai_response';
  payload: {
    requestId: string;
    response: string;
    success: boolean;
    error?: string;
    duration: number;
    toolId: string;
    userId: string;
  };
}

export interface NotificationMessage extends QueueMessage {
  type: 'notification';
  payload: {
    userId: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    data?: Record<string, unknown>;
  };
}

export interface StatusUpdateMessage extends QueueMessage {
  type: 'status_update';
  payload: {
    sessionId: string;
    userId: string;
    status: 'processing' | 'completed' | 'failed' | 'cancelled';
    progress?: number;
    message?: string;
  };
}

export interface QueueStats {
  totalMessages: number;
  processedMessages: number;
  failedMessages: number;
  pendingMessages: number;
  averageProcessingTime: number;
  queueSize: number;
}

export interface QueueHealth {
  status: 'connected' | 'disconnected' | 'error';
  lastHeartbeat: Date;
  connectionErrors: number;
  messageErrors: number;
} 