export interface SocketConfig {
  cors: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
  pingTimeout: number;
  pingInterval: number;
  transports: string[];
}

export interface SocketUser {
  id: string;
  socketId: string;
  sessionId?: string;
  connectedAt: Date;
  lastActivity: Date;
}

export interface SocketEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface AIRequestEvent extends SocketEvent {
  type: 'ai_request';
  data: {
    toolId: string;
    message: string;
    requestId: string;
    sessionId: string;
  };
}

export interface AIResponseEvent extends SocketEvent {
  type: 'ai_response';
  data: {
    requestId: string;
    response: string;
    success: boolean;
    error?: string;
    duration: number;
    toolId: string;
    userId: string;
  };
}

export interface StatusUpdateEvent extends SocketEvent {
  type: 'status_update';
  data: {
    sessionId: string;
    userId: string;
    status: 'processing' | 'completed' | 'failed' | 'cancelled';
    progress?: number;
    message?: string;
  };
}

export interface NotificationEvent extends SocketEvent {
  type: 'notification';
  data: {
    userId: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    data?: Record<string, unknown>;
  };
}

export interface ConnectionEvent extends SocketEvent {
  type: 'connection' | 'disconnection';
  data: {
    userId: string;
    sessionId?: string;
    reason?: string;
  };
}

export interface SocketStats {
  totalConnections: number;
  activeConnections: number;
  totalEvents: number;
  eventsPerMinute: number;
  averageLatency: number;
  rooms: Record<string, number>;
}

export interface SocketHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  lastHeartbeat: Date;
}

export interface RoomInfo {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
  lastActivity: Date;
}

export interface SocketError {
  code: string;
  message: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
} 