import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { SocketConfigManager } from '../config/socket.config';
import { 
  SocketUser, 
  SocketEvent, 
  AIRequestEvent, 
  AIResponseEvent, 
  StatusUpdateEvent, 
  NotificationEvent,
  SocketStats,
  SocketHealth,
  RoomInfo
} from '../types/socket.types';

export class SocketService {
  private static instance: SocketService;
  private configManager: SocketConfigManager;
  private io?: SocketIOServer;
  private users: Map<string, SocketUser> = new Map();
  private rooms: Map<string, RoomInfo> = new Map();
  private stats: SocketStats = {
    totalConnections: 0,
    activeConnections: 0,
    totalEvents: 0,
    eventsPerMinute: 0,
    averageLatency: 0,
    rooms: {}
  };
  private health: SocketHealth = {
    status: 'unhealthy',
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
    lastHeartbeat: new Date()
  };
  private startTime: Date = new Date();
  private eventCounts: number[] = [];

  private constructor() {
    this.configManager = SocketConfigManager.getInstance();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(httpServer: HTTPServer): void {
    const config = this.configManager.getConfig();
    
    this.io = new SocketIOServer(httpServer, {
      cors: config.cors,
      pingTimeout: config.pingTimeout,
      pingInterval: config.pingInterval,
      transports: config.transports as ('polling' | 'websocket')[]
    });

    this.setupEventHandlers();
    this.startHealthMonitoring();
    
    this.health.status = 'healthy';
    console.log('Socket.IO server initialized');
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    const userId = socket.handshake.auth.userId || socket.handshake.query.userId as string;
    const sessionId = socket.handshake.auth.sessionId || socket.handshake.query.sessionId as string;

    if (!userId) {
      socket.disconnect();
      return;
    }

    const user: SocketUser = {
      id: userId,
      socketId: socket.id,
      sessionId,
      connectedAt: new Date(),
      lastActivity: new Date()
    };

    this.users.set(userId, user);
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    // Join user to their personal room
    socket.join(`user:${userId}`);
    if (sessionId) {
      socket.join(`session:${sessionId}`);
    }

    console.log(`User ${userId} connected (socket: ${socket.id})`);

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      this.handleDisconnection(userId, reason);
    });

    // Handle AI request
    socket.on('ai_request', (data: AIRequestEvent['data']) => {
      this.handleAIRequest(socket, data);
    });

    // Handle status updates
    socket.on('status_update', (data: StatusUpdateEvent['data']) => {
      this.handleStatusUpdate(socket, data);
    });

    // Handle ping for latency measurement
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  }

  private handleDisconnection(userId: string, reason: string): void {
    this.users.delete(userId);
    this.stats.activeConnections--;
    
    console.log(`User ${userId} disconnected: ${reason}`);
    // Suppress unused parameter warning
    void reason;
  }

  private handleAIRequest(socket: Socket, data: AIRequestEvent['data']): void {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    this.recordEvent({
      type: 'ai_request',
      data,
      timestamp: new Date(),
      userId,
      sessionId: data.sessionId
    });
    this.updateUserActivity(userId);

    // Emit to user's room for real-time updates
    socket.to(`user:${userId}`).emit('ai_request', data);
  }

  private handleStatusUpdate(socket: Socket, data: StatusUpdateEvent['data']): void {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    this.recordEvent({
      type: 'status_update',
      data,
      timestamp: new Date(),
      userId,
      sessionId: data.sessionId
    });
    this.updateUserActivity(userId);

    // Emit to session room
    if (data.sessionId) {
      socket.to(`session:${data.sessionId}`).emit('status_update', data);
    }
  }

  private getUserIdFromSocket(socket: Socket): string | null {
    for (const [userId, user] of this.users.entries()) {
      if (user.socketId === socket.id) {
        return userId;
      }
    }
    return null;
  }

  private updateUserActivity(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.lastActivity = new Date();
      this.users.set(userId, user);
    }
  }

  private recordEvent(event: SocketEvent): void {
    this.stats.totalEvents++;
    this.eventCounts.push(Date.now());
    
    // Keep only events from last minute
    const oneMinuteAgo = Date.now() - 60000;
    this.eventCounts = this.eventCounts.filter(timestamp => timestamp > oneMinuteAgo);
    this.stats.eventsPerMinute = this.eventCounts.length;
  }

  // Public methods for emitting events
  public emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToSession(sessionId: string, event: string, data: Record<string, unknown>): void {
    if (!this.io) return;
    this.io.to(`session:${sessionId}`).emit(event, data);
  }

  public emitToRoom(roomId: string, event: string, data: Record<string, unknown>): void {
    if (!this.io) return;
    this.io.to(roomId).emit(event, data);
  }

  public emitToAll(event: string, data: Record<string, unknown>): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  public emitAIResponse(response: AIResponseEvent['data']): void {
    this.recordEvent({
      type: 'ai_response',
      data: response,
      timestamp: new Date(),
      userId: response.userId
    });
    this.emitToUser(response.userId, 'ai_response', response);
  }

  public emitNotification(notification: NotificationEvent['data']): void {
    this.recordEvent({
      type: 'notification',
      data: notification,
      timestamp: new Date(),
      userId: notification.userId
    });
    this.emitToUser(notification.userId, 'notification', notification);
  }

  public emitStatusUpdate(status: StatusUpdateEvent['data']): void {
    this.recordEvent({
      type: 'status_update',
      data: status,
      timestamp: new Date(),
      userId: status.userId,
      sessionId: status.sessionId
    });
    if (status.sessionId) {
      this.emitToSession(status.sessionId, 'status_update', status);
    }
  }

  // Room management
  public createRoom(roomId: string, name: string): void {
    const room: RoomInfo = {
      id: roomId,
      name,
      userCount: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    this.rooms.set(roomId, room);
    this.stats.rooms[roomId] = 0;
  }

  public joinRoom(userId: string, roomId: string): void {
    if (!this.io) return;
    
    const user = this.users.get(userId);
    if (user) {
      this.io.to(user.socketId).socketsJoin(roomId);
      
      const room = this.rooms.get(roomId);
      if (room) {
        room.userCount++;
        room.lastActivity = new Date();
        this.rooms.set(roomId, room);
        this.stats.rooms[roomId] = room.userCount;
      }
    }
  }

  public leaveRoom(userId: string, roomId: string): void {
    if (!this.io) return;
    
    const user = this.users.get(userId);
    if (user) {
      this.io.to(user.socketId).socketsLeave(roomId);
      
      const room = this.rooms.get(roomId);
      if (room && room.userCount > 0) {
        room.userCount--;
        room.lastActivity = new Date();
        this.rooms.set(roomId, room);
        this.stats.rooms[roomId] = room.userCount;
      }
    }
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.updateHealth();
    }, 30000); // Update every 30 seconds
  }

  private updateHealth(): void {
    this.health.uptime = Date.now() - this.startTime.getTime();
    this.health.activeConnections = this.stats.activeConnections;
    this.health.lastHeartbeat = new Date();
    
    // Simple health status based on active connections
    if (this.stats.activeConnections > 0) {
      this.health.status = 'healthy';
    } else if (this.stats.totalConnections > 0) {
      this.health.status = 'degraded';
    } else {
      this.health.status = 'unhealthy';
    }
  }

  // Getters
  public getStats(): SocketStats {
    return { ...this.stats };
  }

  public getHealth(): SocketHealth {
    return { ...this.health };
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.users.values());
  }

  public getRooms(): RoomInfo[] {
    return Array.from(this.rooms.values());
  }

  public isUserConnected(userId: string): boolean {
    return this.users.has(userId);
  }

  public getUserSocketId(userId: string): string | null {
    const user = this.users.get(userId);
    return user ? user.socketId : null;
  }
} 