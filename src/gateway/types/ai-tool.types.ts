/* eslint-disable @typescript-eslint/no-unused-vars */
import * as grpc from '@grpc/grpc-js';

export interface ToolConfig {
  id: string;
  name: string;
  address: string;
  port: number;
  timeout?: number;
  retries?: number;
  enabled: boolean;
}

export interface UserMessage {
  message: string;
  user_id: string;
}

export interface ToolResponse {
  response: string;
}

export interface AIToolClient {
  // eslint-disable-next-line no-unused-vars
  ProcessMessage: (
    // eslint-disable-next-line no-unused-vars
    request: UserMessage,
    // eslint-disable-next-line no-unused-vars
    callback: (error: grpc.ServiceError | null, response: ToolResponse) => void
  ) => void;
  close(): void;
}

export interface AIToolService {
  // eslint-disable-next-line no-unused-vars
  AITool: new (address: string, credentials: grpc.ChannelCredentials) => AIToolClient;
}

export interface GatewayConfig {
  tools: ToolConfig[];
  defaultTimeout: number;
  defaultRetries: number;
  connectionPoolSize: number;
}

export interface GatewayResponse {
  success: boolean;
  data?: string;
  error?: string;
  toolId: string;
  timestamp: Date;
  duration: number;
}

export interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  toolUsage: Record<string, number>;
} 