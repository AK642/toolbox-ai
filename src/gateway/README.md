# AI Gateway Architecture

This directory contains a robust, production-ready AI Gateway implementation that provides a unified interface for communicating with multiple AI tool services via gRPC.

## Architecture Overview

The gateway follows a modular, service-oriented architecture with the following key components:

```
src/gateway/
├── types/           # TypeScript type definitions
├── config/          # Configuration management
├── connection/      # Connection pooling
├── retry/          # Retry and circuit breaker logic
├── metrics/        # Performance monitoring
├── services/       # Main gateway service
└── README.md       # This file
```

## Components

### 1. Types (`types/ai-tool.types.ts`)
Defines all TypeScript interfaces for the gateway:
- `ToolConfig`: Configuration for individual AI tools
- `UserMessage` & `ToolResponse`: gRPC message types
- `GatewayResponse`: Standardized response format
- `GatewayMetrics`: Performance metrics structure

### 2. Configuration Manager (`config/gateway.config.ts`)
Singleton service that manages gateway configuration:
- Loads configuration from environment variables
- Provides tool-specific settings (address, port, timeout, retries)
- Supports dynamic configuration updates
- Environment-based configuration (dev/staging/prod)

### 3. Connection Pool (`connection/connection-pool.ts`)
Manages gRPC client connections:
- Connection pooling for better performance
- Automatic client lifecycle management
- Pool statistics and monitoring
- Graceful connection cleanup

### 4. Retry Service (`retry/retry.service.ts`)
Implements resilience patterns:
- Exponential backoff retry logic
- Circuit breaker pattern
- Configurable retry policies
- Failure tracking and recovery

### 5. Metrics Service (`metrics/metrics.service.ts`)
Performance monitoring and observability:
- Request/response tracking
- Success/failure rates
- Response time monitoring
- Tool usage statistics
- Health status assessment

### 6. Gateway Service (`services/ai-gateway.service.ts`)
Main orchestrator that coordinates all components:
- Unified interface for AI tool communication
- Error handling and response formatting
- Integration with all gateway components
- Health and monitoring endpoints

## Environment Configuration

Add these environment variables to your `.env` file:

```env
# Gateway Configuration
GATEWAY_TIMEOUT=30000
GATEWAY_RETRIES=3
GATEWAY_POOL_SIZE=10

# Tool 1 Configuration
TOOL1_ADDRESS=localhost
TOOL1_PORT=50051
TOOL1_TIMEOUT=30000
TOOL1_RETRIES=3
TOOL1_ENABLED=true

# Tool 2 Configuration
TOOL2_ADDRESS=localhost
TOOL2_PORT=50052
TOOL2_TIMEOUT=30000
TOOL2_RETRIES=3
TOOL2_ENABLED=true
```

## Usage

### Basic Usage

```typescript
import { AIGatewayService } from './gateway/services/ai-gateway.service';

const gatewayService = AIGatewayService.getInstance();

// Call an AI tool
const response = await gatewayService.callAITool('tool1', 'Hello AI!', 'user123');

if (response.success) {
    console.log('Response:', response.data);
    console.log('Duration:', response.duration);
} else {
    console.error('Error:', response.error);
}
```

## API Endpoints

The gateway exposes several REST endpoints for monitoring and management:

### Health and Monitoring
- `GET /gateway/health` - Gateway health status
- `GET /gateway/metrics` - Performance metrics
- `GET /gateway/circuit-breaker/stats` - Circuit breaker statistics
- `GET /gateway/connection-pool/stats` - Connection pool statistics
- `GET /gateway/tools/enabled` - List enabled tools

### Management
- `PUT /gateway/tools/:toolId/config` - Update tool configuration
- `POST /gateway/config/reload` - Reload configuration
- `POST /gateway/circuit-breaker/:toolKey/reset` - Reset circuit breaker
- `POST /gateway/connections/close` - Close all connections

## Features

### 1. Resilience
- **Retry Logic**: Exponential backoff with configurable retries
- **Circuit Breaker**: Prevents cascading failures
- **Timeout Handling**: Configurable timeouts per tool
- **Graceful Degradation**: Continues operation even if some tools fail

### 2. Performance
- **Connection Pooling**: Reuses gRPC connections
- **Request Batching**: Efficient resource utilization
- **Response Caching**: Optional caching for repeated requests
- **Load Balancing**: Future support for multiple instances

### 3. Observability
- **Metrics Collection**: Request rates, success rates, response times
- **Health Monitoring**: Real-time health status
- **Circuit Breaker Monitoring**: Failure tracking and recovery
- **Connection Pool Monitoring**: Pool utilization statistics

### 4. Configuration Management
- **Environment-based**: Different configs for dev/staging/prod
- **Dynamic Updates**: Runtime configuration changes
- **Tool-specific Settings**: Individual tool configuration
- **Validation**: Configuration validation and error handling

### 5. Error Handling
- **Standardized Errors**: Consistent error response format
- **Error Classification**: Different error types (timeout, network, service)
- **Error Recovery**: Automatic retry and circuit breaker recovery
- **Error Reporting**: Detailed error information for debugging

## Migration from Old Gateway

The new gateway is backward compatible with the old `callAITool` function. To migrate:

1. **Update imports**:
   ```typescript
   // Old
   import { callAITool } from '../gateway/ai-gateway';
   
   // New
   import { AIGatewayService } from '../gateway/services/ai-gateway.service';
   ```

2. **Update usage**:
   ```typescript
   // Old
   const response = await callAITool(toolId, message, userId);
   
   // New
   const gatewayService = AIGatewayService.getInstance();
   const response = await gatewayService.callAITool(toolId, message, userId);
   
   if (response.success) {
       // Use response.data instead of response directly
       console.log(response.data);
   }
   ```

3. **Add environment variables** for configuration

4. **Update error handling** to check `response.success` 