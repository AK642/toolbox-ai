import 'dotenv/config';
import { createServer } from 'http';
import { App } from './app';
import { initializeDatabase } from './config/database';
import { Mongoose } from 'mongoose';
import './queue/services/worker';

const app = new App();

// Create HTTP server
const httpServer = createServer(app.express);

export let mongoose: Mongoose;

try {
    (async () => {
        // Initialize database connection
        mongoose = await initializeDatabase();

        // Models are automatically initialized when imported
        console.log('MongoDB models initialized');
        
        console.log('MongoDB OK - Database connected successfully');

        // Start the server
        httpServer.listen(process.env.PORT || 5010, () => {
            console.log(`Server is running on port ${process.env.PORT || 5010}`);
        });

        // Note: Seeding is now handled separately to avoid connection conflicts
        // Run seeding only if needed (you can run npm run seed separately)
        console.log('💡 To seed the database, run: npm run seed');
    })();
}catch(err) {
    console.log('Error: ', err);
    console.log('Unable to connect to the database.');
}