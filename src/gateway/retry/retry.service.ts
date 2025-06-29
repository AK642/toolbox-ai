import { ToolConfig } from '../types/ai-tool.types';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class RetryService {
  private static instance: RetryService;
  private failureCounts: Map<string, number> = new Map();
  private circuitBreakerStates: Map<string, boolean> = new Map();
  private lastFailureTimes: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService();
    }
    return RetryService.instance;
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    toolConfig: ToolConfig,
    options?: Partial<RetryOptions>
  ): Promise<T> {
    const retryOptions: RetryOptions = {
      maxRetries: options?.maxRetries ?? toolConfig.retries ?? 3,
      baseDelay: options?.baseDelay ?? 1000,
      maxDelay: options?.maxDelay ?? 10000,
      backoffMultiplier: options?.backoffMultiplier ?? 2,
    };

    const toolKey = `${toolConfig.address}:${toolConfig.port}`;

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(toolKey)) {
      throw new Error(`Circuit breaker is open for tool ${toolConfig.id}`);
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.recordSuccess(toolKey);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.recordFailure(toolKey);
        
        if (attempt === retryOptions.maxRetries) {
          break;
        }

        const delay = this.calculateDelay(attempt, retryOptions);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number, options: RetryOptions): number {
    const delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt);
    return Math.min(delay, options.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private recordSuccess(toolKey: string): void {
    this.failureCounts.set(toolKey, 0);
    this.circuitBreakerStates.set(toolKey, false);
  }

  private recordFailure(toolKey: string): void {
    const currentFailures = this.failureCounts.get(toolKey) || 0;
    this.failureCounts.set(toolKey, currentFailures + 1);
    this.lastFailureTimes.set(toolKey, Date.now());

    // Open circuit breaker if too many failures
    if (currentFailures + 1 >= 5) {
      this.circuitBreakerStates.set(toolKey, true);
    }
  }

  private isCircuitBreakerOpen(toolKey: string): boolean {
    const isOpen = this.circuitBreakerStates.get(toolKey) || false;
    
    if (!isOpen) return false;

    // Check if enough time has passed to try again (30 seconds)
    const lastFailureTime = this.lastFailureTimes.get(toolKey) || 0;
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    
    if (timeSinceLastFailure > 30000) {
      this.circuitBreakerStates.set(toolKey, false);
      this.failureCounts.set(toolKey, 0);
      return false;
    }

    return true;
  }

  public getCircuitBreakerStats(): Record<string, { isOpen: boolean; failureCount: number }> {
    const stats: Record<string, { isOpen: boolean; failureCount: number }> = {};
    
    for (const [toolKey] of this.failureCounts.entries()) {
      stats[toolKey] = {
        isOpen: this.circuitBreakerStates.get(toolKey) || false,
        failureCount: this.failureCounts.get(toolKey) || 0
      };
    }
    
    return stats;
  }

  public resetCircuitBreaker(toolKey: string): void {
    this.failureCounts.set(toolKey, 0);
    this.circuitBreakerStates.set(toolKey, false);
    this.lastFailureTimes.delete(toolKey);
  }
} 