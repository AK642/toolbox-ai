import { Router } from 'express';
import { QueueController } from '../controllers/queue.controller';

const router = Router();
const queueController = new QueueController();

// Health and monitoring routes
router.get('/health', queueController.getHealthStatus);
router.get('/stats', queueController.getStats);
router.get('/connected', queueController.isConnected);

// Management routes
router.post('/connect', queueController.connect);
router.post('/disconnect', queueController.disconnect);
router.post('/publish-test', queueController.publishTestMessage);

export default router; 