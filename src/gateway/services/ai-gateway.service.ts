import * as grpc from '@grpc/grpc-js';
import { GatewayConfigManager } from '../config/gateway.config';
import { ConnectionPool } from '../connection/connection-pool';
import { RetryService } from '../retry/retry.service';
import { MetricsService } from '../metrics/metrics.service';
import { 
  ToolConfig, 
  UserMessage, 
  ToolResponse, 
  GatewayResponse
} from '../types/ai-tool.types';

export class AIGatewayService {
  private static instance: AIGatewayService;
  private configManager: GatewayConfigManager;
  private connectionPool: ConnectionPool;
  private retryService: RetryService;
  private metricsService: MetricsService;

  private constructor() {
    this.configManager = GatewayConfigManager.getInstance();
    this.connectionPool = ConnectionPool.getInstance();
    this.retryService = RetryService.getInstance();
    this.metricsService = MetricsService.getInstance();
  }

  public static getInstance(): AIGatewayService {
    if (!AIGatewayService.instance) {
      AIGatewayService.instance = new AIGatewayService();
    }
    return AIGatewayService.instance;
  }

  public async callAITool(
    toolId: string, 
    message: string, 
    userId: string
  ): Promise<GatewayResponse> {
    const startTime = Date.now();
    
    try {
      // Get tool configuration
      const toolConfig = this.configManager.getToolConfig(toolId);
      if (!toolConfig) {
        return this.createErrorResponse(toolId, 'Unknown tool', startTime);
      }

      if (!toolConfig.enabled) {
        return this.createErrorResponse(toolId, 'Tool is disabled', startTime);
      }

      // Record request for metrics
      this.metricsService.recordRequest(toolId);

      // Execute with retry mechanism
      const response = await this.retryService.executeWithRetry(
        () => this.executeToolCall(toolConfig, message, userId),
        toolConfig
      );

      const duration = Date.now() - startTime;
      const gatewayResponse: GatewayResponse = {
        success: true,
        data: response,
        toolId,
        timestamp: new Date(),
        duration
      };

      this.metricsService.recordResponse(gatewayResponse);
      return gatewayResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResponse = this.createErrorResponse(
        toolId, 
        error instanceof Error ? error.message : 'Unknown error', 
        startTime
      );
      errorResponse.duration = duration;
      
      this.metricsService.recordResponse(errorResponse);
      return errorResponse;
    }
  }

  private async executeToolCall(
    toolConfig: ToolConfig, 
    message: string, 
    userId: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = this.connectionPool.getClient(toolConfig);
      
      const userMessage: UserMessage = {
        message,
        user_id: userId
      };

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
        this.connectionPool.releaseClient(toolConfig, client);
      }, toolConfig.timeout || 30000);

      client.ProcessMessage(
        userMessage,
        (err: grpc.ServiceError | null, response: ToolResponse) => {
          clearTimeout(timeout);
          this.connectionPool.releaseClient(toolConfig, client);
          
          if (err) {
            reject(new Error(`gRPC error: ${err.message}`));
          } else {
            resolve(response.response);
          }
        }
      );
    });
  }

  private createErrorResponse(
    toolId: string, 
    error: string, 
    startTime: number
  ): GatewayResponse {
    return {
      success: false,
      error,
      toolId,
      timestamp: new Date(),
      duration: Date.now() - startTime
    };
  }

  // Health and monitoring methods
  public getHealthStatus() {
    return this.metricsService.getHealthStatus();
  }

  public getMetrics() {
    return this.metricsService.getMetrics();
  }

  public getCircuitBreakerStats() {
    return this.retryService.getCircuitBreakerStats();
  }

  public getConnectionPoolStats() {
    return this.connectionPool.getPoolStats();
  }

  public getEnabledTools() {
    return this.configManager.getEnabledTools();
  }

  public updateToolConfig(toolId: string, updates: Partial<ToolConfig>): boolean {
    return this.configManager.updateToolConfig(toolId, updates);
  }

  public reloadConfig(): void {
    this.configManager.reloadConfig();
  }

  public resetCircuitBreaker(toolKey: string): void {
    this.retryService.resetCircuitBreaker(toolKey);
  }

  public closeConnections(): void {
    this.connectionPool.closeAllPools();
  }
} 