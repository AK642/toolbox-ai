import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../utils/http-status';
import { QueueService } from '../queue/services/queue.service';
import { QueueMessage } from '../queue/types/queue.types';

export class QueueController extends HttpStatus {
    private queueService: QueueService = QueueService.getInstance();

    /** GET: Get queue health status */
    public getHealthStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const health = this.queueService.getHealth();
            this.success(res, 'Queue health status retrieved successfully.', health);
        } catch (err) {
            this.badRequest(res, 'Failed to get queue health status.');
            next(err);
        }
    };

    /** GET: Get queue statistics */
    public getStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = this.queueService.getStats();
            this.success(res, 'Queue statistics retrieved successfully.', stats);
        } catch (err) {
            this.badRequest(res, 'Failed to get queue statistics.');
            next(err);
        }
    };

    /** POST: Connect to queue */
    public connect = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.queueService.connect();
            this.success(res, 'Queue connected successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to connect to queue.');
            next(err);
        }
    };

    /** POST: Disconnect from queue */
    public disconnect = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.queueService.disconnect();
            this.success(res, 'Queue disconnected successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to disconnect from queue.');
            next(err);
        }
    };

    /** GET: Check if queue is connected */
    public isConnected = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const connected = this.queueService.isQueueConnected();
            this.success(res, 'Queue connection status retrieved successfully.', { connected });
        } catch (err) {
            this.badRequest(res, 'Failed to get queue connection status.');
            next(err);
        }
    };

    /** POST: Publish test message */
    public publishTestMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { message, queue } = req.body;
            
            if (!message || !queue) {
                return this.badRequest(res, 'Message and queue are required.');
            }

            // Create a simple test message
            const testMessage: QueueMessage = {
                id: 'test-' + Date.now(),
                type: 'notification',
                payload: { 
                    userId: 'test-user',
                    type: 'info',
                    title: 'Test Message',
                    message: message as string
                },
                timestamp: new Date(),
                userId: 'test-user'
            };

            const success = await this.queueService.publishMessage(testMessage, queue);
            
            if (success) {
                this.success(res, 'Test message published successfully.');
            } else {
                this.badRequest(res, 'Failed to publish test message.');
            }
        } catch (err) {
            this.badRequest(res, 'Failed to publish test message.');
            next(err);
        }
    };

    /** POST: Publish AI request */
    public publishAIRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, toolId, message, sessionId } = req.body;
            
            if (!userId || !toolId || !message) {
                return this.badRequest(res, 'User ID, tool ID, and message are required.');
            }

            const requestId = await this.queueService.publishAIRequest({
                userId,
                toolId,
                message,
                sessionId
            });

            if (requestId) {
                this.success(res, 'AI request published successfully.', { requestId });
            } else {
                this.badRequest(res, 'Failed to publish AI request.');
            }
        } catch (err) {
            this.badRequest(res, 'Failed to publish AI request.');
            next(err);
        }
    };

    /** POST: Publish AI response */
    public publishAIResponse = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { requestId, response, success, error, duration, toolId, userId } = req.body;
            
            if (!requestId || !toolId || !userId) {
                return this.badRequest(res, 'Request ID, tool ID, and user ID are required.');
            }

            const result = await this.queueService.publishAIResponse({
                requestId,
                response,
                success,
                error,
                duration,
                toolId,
                userId
            });

            if (result) {
                this.success(res, 'AI response published successfully.');
            } else {
                this.badRequest(res, 'Failed to publish AI response.');
            }
        } catch (err) {
            this.badRequest(res, 'Failed to publish AI response.');
            next(err);
        }
    };

    /** POST: Publish notification */
    public publishNotification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, type, title, message, data } = req.body;
            
            if (!userId || !type || !title || !message) {
                return this.badRequest(res, 'User ID, type, title, and message are required.');
            }

            const result = await this.queueService.publishNotification({
                userId,
                type,
                title,
                message,
                data: data || {}
            });

            if (result) {
                this.success(res, 'Notification published successfully.');
            } else {
                this.badRequest(res, 'Failed to publish notification.');
            }
        } catch (err) {
            this.badRequest(res, 'Failed to publish notification.');
            next(err);
        }
    };

    /** POST: Publish status update */
    public publishStatusUpdate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, sessionId, status, progress, message } = req.body;
            
            if (!userId || !sessionId || !status) {
                return this.badRequest(res, 'User ID, session ID, and status are required.');
            }

            const result = await this.queueService.publishStatusUpdate({
                userId,
                sessionId,
                status,
                progress,
                message
            });

            if (result) {
                this.success(res, 'Status update published successfully.');
            } else {
                this.badRequest(res, 'Failed to publish status update.');
            }
        } catch (err) {
            this.badRequest(res, 'Failed to publish status update.');
            next(err);
        }
    };
} 