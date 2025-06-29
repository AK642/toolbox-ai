import { SocketConfig } from '../types/socket.types';
import env from '../../utils/validate-env';

export class SocketConfigManager {
  private static instance: SocketConfigManager;
  private config: SocketConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): SocketConfigManager {
    if (!SocketConfigManager.instance) {
      SocketConfigManager.instance = new SocketConfigManager();
    }
    return SocketConfigManager.instance;
  }

  private loadConfig(): SocketConfig {
    return {
      cors: {
        origin: env.SOCKET_CORS_ORIGIN.split(','),
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: env.SOCKET_PING_TIMEOUT,
      pingInterval: env.SOCKET_PING_INTERVAL,
      transports: ['websocket', 'polling']
    };
  }

  public getConfig(): SocketConfig {
    return this.config;
  }

  public reloadConfig(): void {
    this.config = this.loadConfig();
  }
} 