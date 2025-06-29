import mongoose from 'mongoose';
import { config } from './config';
import env from '../utils/validate-env';

// Get database configuration
const environment: string = env.NODE_ENV;
const databaseConfiguration = config[environment];

/**
 * Initialize MongoDB connection using Mongoose
 * @returns Promise<mongoose.Connection> - Connected Mongoose connection
 */
export const initializeDatabase = async (): Promise<typeof mongoose> => {
    try {
        // Connect to MongoDB
        await mongoose.connect(databaseConfiguration.uri, databaseConfiguration.options);
        
        console.log('MongoDB connection has been established successfully.');
        
        // Handle connection events
        mongoose.connection.on('error', (err: Error) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return mongoose;
    } catch (error) {
        console.error('Unable to connect to MongoDB:', error);
        throw error;
    }
};

/**
 * Get database configuration for reference
 */
export const getDatabaseConfig = () => ({
    uri: databaseConfiguration.uri,
    options: databaseConfiguration.options
});

export { databaseConfiguration }; 