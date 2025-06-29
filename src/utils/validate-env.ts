import { cleanEnv } from 'envalid';
import { port, str, num } from 'envalid/dist/validators';

export default cleanEnv(process.env, {
    // Server Environment
    NODE_ENV: str(),

    // API Port
    PORT: port(),

    API_URL: str(),

    // Database Configuration
    MONGODB_URI: str(),

    SECRET_KEY: str(),

    // Gateway Configuration
    GATEWAY_TIMEOUT: num({ default: 30000 }),
    GATEWAY_RETRIES: num({ default: 3 }),
    GATEWAY_POOL_SIZE: num({ default: 10 }),

    // Tool 1 Configuration
    TOOL1_ADDRESS: str({ default: 'localhost' }),
    TOOL1_PORT: num({ default: 50051 }),
    TOOL1_TIMEOUT: num({ default: 30000 }),
    TOOL1_RETRIES: num({ default: 3 }),
    TOOL1_ENABLED: str({ default: 'true' }),

    // Tool 2 Configuration
    TOOL2_ADDRESS: str({ default: 'localhost' }),
    TOOL2_PORT: num({ default: 50052 }),
    TOOL2_TIMEOUT: num({ default: 30000 }),
    TOOL2_RETRIES: num({ default: 3 }),
    TOOL2_ENABLED: str({ default: 'true' }),

    // RabbitMQ Configuration
    RABBITMQ_HOST: str({ default: 'localhost' }),
    RABBITMQ_PORT: num({ default: 5672 }),
    RABBITMQ_USERNAME: str({ default: 'guest' }),
    RABBITMQ_PASSWORD: str({ default: 'guest' }),
    RABBITMQ_VHOST: str({ default: '/' }),
    RABBITMQ_CONNECTION_TIMEOUT: num({ default: 30000 }),
    RABBITMQ_HEARTBEAT: num({ default: 60 }),

    // Socket.IO Configuration
    SOCKET_CORS_ORIGIN: str({ default: 'http://localhost:3000' }),
    SOCKET_PING_TIMEOUT: num({ default: 60000 }),
    SOCKET_PING_INTERVAL: num({ default: 25000 }),
});