import { GatewayMetrics, GatewayResponse } from '../types/ai-tool.types';

export class MetricsService {
  private static instance: MetricsService;
  private metrics: GatewayMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    toolUsage: {}
  };
  private responseTimes: number[] = [];
  private startTime: number = Date.now();

  private constructor() {}

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public recordRequest(toolId: string): void {
    this.metrics.totalRequests++;
    this.metrics.toolUsage[toolId] = (this.metrics.toolUsage[toolId] || 0) + 1;
  }

  public recordResponse(response: GatewayResponse): void {
    const duration = response.duration;
    this.responseTimes.push(duration);

    if (response.success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Calculate average response time (keep last 1000 responses)
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
    
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  public getMetrics(): GatewayMetrics {
    return { ...this.metrics };
  }

  public getUptime(): number {
    return Date.now() - this.startTime;
  }

  public getRequestRate(): number {
    const uptime = this.getUptime() / 1000; // Convert to seconds
    return this.metrics.totalRequests / uptime;
  }

  public getSuccessRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
  }

  public getToolUsageStats(): Record<string, { count: number; percentage: number }> {
    const stats: Record<string, { count: number; percentage: number }> = {};
    
    for (const [toolId, count] of Object.entries(this.metrics.toolUsage)) {
      const percentage = this.metrics.totalRequests > 0 
        ? (count / this.metrics.totalRequests) * 100 
        : 0;
      
      stats[toolId] = { count, percentage };
    }
    
    return stats;
  }

  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      toolUsage: {}
    };
    this.responseTimes = [];
    this.startTime = Date.now();
  }

  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    successRate: number;
    averageResponseTime: number;
    uptime: number;
  } {
    const successRate = this.getSuccessRate();
    const averageResponseTime = this.metrics.averageResponseTime;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (successRate < 95 || averageResponseTime > 5000) {
      status = 'degraded';
    }
    
    if (successRate < 80 || averageResponseTime > 10000) {
      status = 'unhealthy';
    }
    
    return {
      status,
      successRate,
      averageResponseTime,
      uptime: this.getUptime()
    };
  }
} 