import { QueueConfig } from '../types/queue.types';
import env from '../../utils/validate-env';

export class QueueConfigManager {
  private static instance: QueueConfigManager;
  private config: QueueConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): QueueConfigManager {
    if (!QueueConfigManager.instance) {
      QueueConfigManager.instance = new QueueConfigManager();
    }
    return QueueConfigManager.instance;
  }

  private loadConfig(): QueueConfig {
    return {
      host: env.RABBITMQ_HOST,
      port: env.RABBITMQ_PORT,
      username: env.RABBITMQ_USERNAME,
      password: env.RABBITMQ_PASSWORD,
      vhost: env.RABBITMQ_VHOST,
      connectionTimeout: env.RABBITMQ_CONNECTION_TIMEOUT,
      heartbeat: env.RABBITMQ_HEARTBEAT
    };
  }

  public getConfig(): QueueConfig {
    return this.config;
  }

  public getConnectionString(): string {
    return `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.vhost}`;
  }

  public reloadConfig(): void {
    this.config = this.loadConfig();
  }
} 