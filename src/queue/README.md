# Queue System Architecture (RabbitMQ)

This directory contains a robust RabbitMQ queue system implementation for handling asynchronous message processing, AI tool requests, and notifications.

## Architecture Overview

```
src/queue/
├── types/           # TypeScript type definitions
├── config/          # Configuration management
├── services/        # Queue service implementation
└── README.md        # This file
```

## Components

### 1. Types (`types/queue.types.ts`)
Defines all TypeScript interfaces for the queue system:
- `QueueConfig`: RabbitMQ connection configuration
- `QueueMessage`: Base message interface
- `AIRequestMessage`: AI tool request messages
- `AIResponseMessage`: AI tool response messages
- `NotificationMessage`: User notification messages
- `StatusUpdateMessage`: Status update messages
- `QueueStats`: Performance metrics
- `QueueHealth`: Health status

### 2. Configuration Manager (`config/queue.config.ts`)
Singleton service that manages RabbitMQ configuration:
- Loads configuration from environment variables
- Provides connection string generation
- Supports dynamic configuration updates

### 3. Queue Service (`services/queue.service.ts`)
Main service that handles RabbitMQ operations:
- Connection management with automatic reconnection
- Message publishing and consuming
- Queue and exchange setup
- Error handling and retry logic
- Health monitoring and statistics

## Environment Configuration

Add these environment variables to your `.env` file:

```env
# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
RABBITMQ_CONNECTION_TIMEOUT=30000
RABBITMQ_HEARTBEAT=60
```

## Usage

### Basic Usage

```typescript
import { QueueService } from './queue/services/queue.service';

const queueService = QueueService.getInstance();

// Connect to RabbitMQ
await queueService.connect();

// Publish AI request
const requestId = await queueService.publishAIRequest({
  toolId: 'tool1',
  message: 'Hello AI!',
  userId: 'user123',
  sessionId: 'session456'
});

// Publish notification
await queueService.publishNotification({
  userId: 'user123',
  type: 'success',
  title: 'Success',
  message: 'Your request was processed successfully'
});

// Consume messages
await queueService.consumeMessages('ai_requests', async (message) => {
  console.log('Processing message:', message);
  // Process the message
});
```

## Queue Structure

### Queues
- `ai_requests`: AI tool requests from users
- `ai_responses`: AI tool responses
- `notifications`: User notifications
- `status_updates`: Status updates for long-running processes

### Exchanges
- `ai_events`: Topic exchange for AI-related events
- `user_events`: Topic exchange for user-related events

### Routing Keys
- `ai.request`: AI tool requests
- `ai.response`: AI tool responses
- `user.notification`: User notifications
- `user.status`: User status updates

## Message Types

### AI Request Message
```typescript
{
  id: string;
  type: 'ai_request';
  payload: {
    toolId: string;
    message: string;
    userId: string;
    sessionId: string;
    requestId: string;
  };
  timestamp: Date;
  userId: string;
  toolId: string;
  sessionId: string;
}
```

### AI Response Message
```typescript
{
  id: string;
  type: 'ai_response';
  payload: {
    requestId: string;
    response: string;
    success: boolean;
    error?: string;
    duration: number;
    toolId: string;
    userId: string;
  };
  timestamp: Date;
  userId: string;
  toolId: string;
}
```

### Notification Message
```typescript
{
  id: string;
  type: 'notification';
  payload: {
    userId: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    data?: Record<string, unknown>;
  };
  timestamp: Date;
  userId: string;
}
```

## API Endpoints

### Health and Monitoring
- `GET /queue/health` - Queue health status
- `GET /queue/stats` - Queue statistics
- `GET /queue/connected` - Connection status

### Management
- `POST /queue/connect` - Connect to RabbitMQ
- `POST /queue/disconnect` - Disconnect from RabbitMQ
- `POST /queue/publish-test` - Publish test message

## Features

### 1. Resilience
- **Automatic Reconnection**: Exponential backoff retry logic
- **Connection Monitoring**: Health checks and error tracking
- **Message Persistence**: Durable queues and persistent messages
- **Error Handling**: Dead letter queues and message acknowledgment

### 2. Performance
- **Connection Pooling**: Efficient connection management
- **Message Batching**: Batch processing capabilities
- **Load Balancing**: Multiple consumer support
- **Message Prioritization**: Priority queue support

### 3. Monitoring
- **Statistics Collection**: Message counts, processing times
- **Health Monitoring**: Connection status, error rates
- **Queue Metrics**: Queue sizes, consumer counts
- **Performance Tracking**: Average processing times

### 4. Message Processing
- **Type Safety**: Strongly typed message interfaces
- **Validation**: Message structure validation
- **Retry Logic**: Configurable retry policies
- **Dead Letter Handling**: Failed message processing

## Integration with Other Systems

### Gateway Integration
The queue system integrates with the AI Gateway for:
- Asynchronous AI tool processing
- Request/response handling
- Status updates for long-running operations

### Socket.IO Integration
The queue system works with Socket.IO for:
- Real-time notifications
- Status updates to frontend
- User session management

### Logging Integration
The queue system provides:
- Connection event logging
- Message processing logs
- Error tracking and reporting
- Performance metrics logging

## Best Practices

### 1. Message Design
- Keep messages small and focused
- Use consistent message structure
- Include necessary metadata
- Implement proper error handling

### 2. Queue Management
- Use durable queues for important messages
- Implement dead letter queues
- Set appropriate TTL values
- Monitor queue sizes

### 3. Performance
- Use connection pooling
- Implement message batching
- Monitor processing times
- Scale consumers as needed

### 4. Monitoring
- Set up health checks
- Monitor queue statistics
- Track error rates
- Implement alerting

## Error Handling

### Connection Errors
- Automatic reconnection with exponential backoff
- Connection health monitoring
- Error logging and reporting

### Message Errors
- Message acknowledgment and rejection
- Dead letter queue handling
- Retry logic with configurable policies
- Error tracking and metrics

### Consumer Errors
- Graceful error handling
- Message requeuing
- Error logging and monitoring
- Circuit breaker patterns

## Future Enhancements

- **Message Encryption**: End-to-end message encryption
- **Message Compression**: Automatic message compression
- **Advanced Routing**: Complex routing patterns
- **Message Scheduling**: Delayed message delivery
- **Message Deduplication**: Duplicate message handling
- **Message Correlation**: Request-response correlation
- **Message Tracing**: Distributed tracing support
- **Message Validation**: Schema validation 