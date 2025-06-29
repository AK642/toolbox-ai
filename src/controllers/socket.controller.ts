import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../utils/http-status';
import { SocketService } from '../socket/services/socket.service';

export class SocketController extends HttpStatus {
    private socketService: SocketService = SocketService.getInstance();

    /** GET: Get socket health status */
    public getHealthStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const health = this.socketService.getHealth();
            this.success(res, 'Socket health status retrieved successfully.', health);
        } catch (err) {
            this.badRequest(res, 'Failed to get socket health status.');
            next(err);
        }
    };

    /** GET: Get socket statistics */
    public getStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = this.socketService.getStats();
            this.success(res, 'Socket statistics retrieved successfully.', stats);
        } catch (err) {
            this.badRequest(res, 'Failed to get socket statistics.');
            next(err);
        }
    };

    /** GET: Get connected users */
    public getConnectedUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = this.socketService.getConnectedUsers();
            this.success(res, 'Connected users retrieved successfully.', users);
        } catch (err) {
            this.badRequest(res, 'Failed to get connected users.');
            next(err);
        }
    };

    /** GET: Get rooms */
    public getRooms = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rooms = this.socketService.getRooms();
            this.success(res, 'Rooms retrieved successfully.', rooms);
        } catch (err) {
            this.badRequest(res, 'Failed to get rooms.');
            next(err);
        }
    };

    /** GET: Check if user is connected */
    public isUserConnected = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;
            const connected = this.socketService.isUserConnected(userId);
            this.success(res, 'User connection status retrieved successfully.', { userId, connected });
        } catch (err) {
            this.badRequest(res, 'Failed to get user connection status.');
            next(err);
        }
    };

    /** POST: Create room */
    public createRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { roomId, name } = req.body;
            
            if (!roomId || !name) {
                return this.badRequest(res, 'Room ID and name are required.');
            }

            this.socketService.createRoom(roomId, name);
            this.success(res, 'Room created successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to create room.');
            next(err);
        }
    };

    /** POST: Join room */
    public joinRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, roomId } = req.body;
            
            if (!userId || !roomId) {
                return this.badRequest(res, 'User ID and room ID are required.');
            }

            this.socketService.joinRoom(userId, roomId);
            this.success(res, 'User joined room successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to join room.');
            next(err);
        }
    };

    /** POST: Leave room */
    public leaveRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, roomId } = req.body;
            
            if (!userId || !roomId) {
                return this.badRequest(res, 'User ID and room ID are required.');
            }

            this.socketService.leaveRoom(userId, roomId);
            this.success(res, 'User left room successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to leave room.');
            next(err);
        }
    };

    /** POST: Send notification to user */
    public sendNotification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, type, title, message, data } = req.body;
            
            if (!userId || !type || !title || !message) {
                return this.badRequest(res, 'User ID, type, title, and message are required.');
            }

            this.socketService.emitNotification({
                userId,
                type,
                title,
                message,
                data
            });
            
            this.success(res, 'Notification sent successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to send notification.');
            next(err);
        }
    };

    /** POST: Send message to room */
    public sendToRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { roomId, event, data } = req.body;
            
            if (!roomId || !event) {
                return this.badRequest(res, 'Room ID and event are required.');
            }

            this.socketService.emitToRoom(roomId, event, data || {});
            this.success(res, 'Message sent to room successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to send message to room.');
            next(err);
        }
    };
} 