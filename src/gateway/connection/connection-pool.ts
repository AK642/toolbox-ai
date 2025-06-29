import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { AIToolClient, ToolConfig } from '../types/ai-tool.types';

export class ConnectionPool {
  private static instance: ConnectionPool;
  private pools: Map<string, AIToolClient[]> = new Map();
  // eslint-disable-next-line no-unused-vars
  private config!: new (address: string, credentials: grpc.ChannelCredentials) => AIToolClient;

  private constructor() {
    this.loadProto();
  }

  public static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  private loadProto(): void {
    const PROTO_PATH = __dirname + '/../../../proto/tool.proto';
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.config = (protoDescriptor as any).AITool;
  }

  public getClient(toolConfig: ToolConfig): AIToolClient {
    const poolKey = `${toolConfig.address}:${toolConfig.port}`;
    
    if (!this.pools.has(poolKey)) {
      this.pools.set(poolKey, []);
    }

    const pool = this.pools.get(poolKey)!;
    
    // Return existing client if available
    if (pool.length > 0) {
      return pool.pop()!;
    }

    // Create new client if pool is empty
    const address = `${toolConfig.address}:${toolConfig.port}`;
    return new this.config(address, grpc.credentials.createInsecure());
  }

  public releaseClient(toolConfig: ToolConfig, client: AIToolClient): void {
    const poolKey = `${toolConfig.address}:${toolConfig.port}`;
    
    if (!this.pools.has(poolKey)) {
      this.pools.set(poolKey, []);
    }

    const pool = this.pools.get(poolKey)!;
    
    // Add client back to pool if pool is not full
    if (pool.length < 10) { // Max pool size
      pool.push(client);
    } else {
      // Close client if pool is full
      client.close();
    }
  }

  public closeAllPools(): void {
    for (const [, pool] of this.pools.entries()) {
      for (const client of pool) {
        client.close();
      }
      pool.length = 0;
    }
    this.pools.clear();
  }

  public getPoolStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [poolKey, pool] of this.pools.entries()) {
      stats[poolKey] = pool.length;
    }
    return stats;
  }
} 