# Socket.IO System Architecture

This directory contains a robust Socket.IO implementation for real-time communication between the frontend (Next.js) and backend (Node.js) gateway.

## Architecture Overview

```
src/socket/
├── types/           # TypeScript type definitions
├── config/          # Configuration management
├── services/        # Socket service implementation
└── README.md        # This file
```

## Components

### 1. Types (`types/socket.types.ts`)
Defines all TypeScript interfaces for the Socket.IO system:
- `SocketConfig`: Socket.IO server configuration
- `SocketUser`: Connected user information
- `SocketEvent`: Base event interface
- `AIRequestEvent`: AI tool request events
- `AIResponseEvent`: AI tool response events
- `StatusUpdateEvent`: Status update events
- `NotificationEvent`: Notification events
- `SocketStats`: Performance metrics
- `SocketHealth`: Health status

### 2. Configuration Manager (`config/socket.config.ts`)
Singleton service that manages Socket.IO configuration:
- Loads configuration from environment variables
- CORS settings for frontend integration
- Connection timeout and interval settings
- Transport protocol configuration

### 3. Socket Service (`services/socket.service.ts`)
Main service that handles Socket.IO operations:
- Connection management and user tracking
- Event handling and routing
- Room management for group communication
- Health monitoring and statistics
- Real-time event emission

## Environment Configuration

Add these environment variables to your `.env` file:

```env
# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
```

## Usage

### Backend Initialization

```typescript
import { SocketService } from './socket/services/socket.service';
import { createServer } from 'http';

const httpServer = createServer(app);
const socketService = SocketService.getInstance();

// Initialize Socket.IO with HTTP server
socketService.initialize(httpServer);

// Start the server
httpServer.listen(port);
```

### Frontend Connection (Next.js)

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3001', {
  auth: {
    userId: 'user123',
    sessionId: 'session456'
  },
  transports: ['websocket', 'polling']
});

// Listen for AI responses
socket.on('ai_response', (data) => {
  console.log('AI Response:', data);
});

// Listen for notifications
socket.on('notification', (data) => {
  console.log('Notification:', data);
});

// Listen for status updates
socket.on('status_update', (data) => {
  console.log('Status Update:', data);
});

// Send AI request
socket.emit('ai_request', {
  toolId: 'tool1',
  message: 'Hello AI!',
  requestId: 'req123',
  sessionId: 'session456'
});
```

## API Endpoints

### Health and Monitoring
- `GET /socket/health` - Socket health status
- `GET /socket/stats` - Socket statistics
- `GET /socket/users` - Connected users
- `GET /socket/rooms` - Active rooms
- `GET /socket/users/:userId/connected` - User connection status

### Room Management
- `POST /socket/rooms` - Create room
- `POST /socket/rooms/join` - Join room
- `POST /socket/rooms/leave` - Leave room

### Communication
- `POST /socket/notifications` - Send notification to user
- `POST /socket/rooms/message` - Send message to room

## Features

### 1. Real-time Communication
- **Bidirectional Communication**: Real-time data exchange
- **Event-driven Architecture**: Event-based communication
- **Automatic Reconnection**: Client-side reconnection handling
- **Transport Fallback**: WebSocket with polling fallback

### 2. User Management
- **User Authentication**: User ID and session management
- **Connection Tracking**: Active user monitoring
- **Session Management**: Session-based room assignment
- **Activity Monitoring**: User activity tracking

### 3. Room Management
- **Dynamic Rooms**: Create and manage rooms on-demand
- **User Rooms**: Automatic user-specific rooms
- **Session Rooms**: Session-based group communication
- **Room Statistics**: Room usage monitoring

### 4. Event Handling
- **Type Safety**: Strongly typed event interfaces
- **Event Routing**: Targeted event emission
- **Event Validation**: Event structure validation
- **Event Logging**: Event tracking and monitoring

### 5. Performance
- **Connection Pooling**: Efficient connection management
- **Event Batching**: Batch event processing
- **Memory Management**: Automatic cleanup
- **Latency Monitoring**: Connection latency tracking

## Integration with Other Systems

### Gateway Integration
The Socket.IO system integrates with the AI Gateway for:
- Real-time AI tool responses
- Status updates for long-running operations
- Error notifications and alerts

### Queue Integration
The Socket.IO system works with RabbitMQ for:
- Asynchronous message processing
- Event-driven notifications
- Status update broadcasting

### Frontend Integration
The Socket.IO system provides:
- Real-time UI updates
- Live notifications
- Progress indicators
- Status feedback

## Best Practices

### 1. Connection Management
- Implement proper authentication
- Handle connection errors gracefully
- Monitor connection health
- Implement reconnection logic

### 2. Event Design
- Use consistent event naming
- Keep event payloads small
- Include necessary metadata
- Implement proper error handling

### 3. Room Management
- Use meaningful room names
- Implement room cleanup
- Monitor room usage
- Handle room access control

### 4. Performance
- Limit event frequency
- Implement event throttling
- Monitor memory usage
- Use efficient data structures

### 5. Security
- Validate user authentication
- Sanitize event data
- Implement rate limiting
- Monitor for abuse

## Error Handling

### Connection Errors
- Automatic reconnection
- Connection health monitoring
- Error logging and reporting
- Graceful degradation

### Event Errors
- Event validation
- Error event emission
- Error tracking and monitoring
- Fallback mechanisms

### Authentication Errors
- User validation
- Session management
- Access control
- Security logging

## Monitoring and Observability

### Health Monitoring
- Connection status
- Event processing rates
- Error rates
- Performance metrics

### Statistics Collection
- Active connections
- Event counts
- Room usage
- User activity

### Logging
- Connection events
- Event processing
- Error tracking
- Performance logging

## Future Enhancements

- **Message Encryption**: End-to-end encryption
- **Message Compression**: Automatic compression
- **Advanced Authentication**: JWT and OAuth integration
- **Message Persistence**: Message history
- **Message Broadcasting**: Global announcements
- **Message Filtering**: Event filtering
- **Message Queuing**: Offline message handling
- **Message Acknowledgment**: Message delivery confirmation
- **Message Scheduling**: Delayed message delivery
- **Message Templates**: Predefined message templates 