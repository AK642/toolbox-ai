import { Router } from 'express';
import { SocketController } from '../controllers/socket.controller';

const router = Router();
const socketController = new SocketController();

// Health and monitoring routes
router.get('/health', socketController.getHealthStatus);
router.get('/stats', socketController.getStats);
router.get('/users', socketController.getConnectedUsers);
router.get('/rooms', socketController.getRooms);
router.get('/users/:userId/connected', socketController.isUserConnected);

// Room management routes
router.post('/rooms', socketController.createRoom);
router.post('/rooms/join', socketController.joinRoom);
router.post('/rooms/leave', socketController.leaveRoom);

// Communication routes
router.post('/notifications', socketController.sendNotification);
router.post('/rooms/message', socketController.sendToRoom);

export default router; 