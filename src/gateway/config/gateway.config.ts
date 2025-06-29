import { ToolConfig, GatewayConfig } from '../types/ai-tool.types';
import env from '../../utils/validate-env';

export class GatewayConfigManager {
  private static instance: GatewayConfigManager;
  private config: GatewayConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): GatewayConfigManager {
    if (!GatewayConfigManager.instance) {
      GatewayConfigManager.instance = new GatewayConfigManager();
    }
    return GatewayConfigManager.instance;
  }

  private loadConfig(): GatewayConfig {
    // Load from environment variables or use defaults
    const defaultTimeout = env.GATEWAY_TIMEOUT;
    const defaultRetries = env.GATEWAY_RETRIES;
    const connectionPoolSize = env.GATEWAY_POOL_SIZE;

    const tools: ToolConfig[] = [
      {
        id: 'tool1',
        name: 'AI Tool 1',
        address: env.TOOL1_ADDRESS,
        port: env.TOOL1_PORT,
        timeout: env.TOOL1_TIMEOUT,
        retries: env.TOOL1_RETRIES,
        enabled: env.TOOL1_ENABLED === 'true'
      },
      {
        id: 'tool2',
        name: 'AI Tool 2',
        address: env.TOOL2_ADDRESS,
        port: env.TOOL2_PORT,
        timeout: env.TOOL2_TIMEOUT,
        retries: env.TOOL2_RETRIES,
        enabled: env.TOOL2_ENABLED === 'true'
      }
    ];

    return {
      tools,
      defaultTimeout,
      defaultRetries,
      connectionPoolSize
    };
  }

  public getConfig(): GatewayConfig {
    return this.config;
  }

  public getToolConfig(toolId: string): ToolConfig | undefined {
    return this.config.tools.find(tool => tool.id === toolId);
  }

  public getEnabledTools(): ToolConfig[] {
    return this.config.tools.filter(tool => tool.enabled);
  }

  public updateToolConfig(toolId: string, updates: Partial<ToolConfig>): boolean {
    const toolIndex = this.config.tools.findIndex(tool => tool.id === toolId);
    if (toolIndex === -1) return false;
    
    this.config.tools[toolIndex] = { ...this.config.tools[toolIndex], ...updates };
    return true;
  }

  public reloadConfig(): void {
    this.config = this.loadConfig();
  }
} 