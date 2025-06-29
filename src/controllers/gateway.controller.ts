import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../utils/http-status';
import { AIGatewayService } from '../gateway/services/ai-gateway.service';

export class GatewayController extends HttpStatus {
    private gatewayService: AIGatewayService = AIGatewayService.getInstance();

    /** GET: Get gateway health status */
    public getHealthStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const healthStatus = this.gatewayService.getHealthStatus();
            this.success(res, 'Gateway health status retrieved successfully.', healthStatus);
        } catch (err) {
            this.badRequest(res, 'Failed to get gateway health status.');
            next(err);
        }
    };

    /** GET: Get gateway metrics */
    public getMetrics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const metrics = this.gatewayService.getMetrics();
            this.success(res, 'Gateway metrics retrieved successfully.', metrics);
        } catch (err) {
            this.badRequest(res, 'Failed to get gateway metrics.');
            next(err);
        }
    };

    /** GET: Get circuit breaker statistics */
    public getCircuitBreakerStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = this.gatewayService.getCircuitBreakerStats();
            this.success(res, 'Circuit breaker statistics retrieved successfully.', stats);
        } catch (err) {
            this.badRequest(res, 'Failed to get circuit breaker statistics.');
            next(err);
        }
    };

    /** GET: Get connection pool statistics */
    public getConnectionPoolStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = this.gatewayService.getConnectionPoolStats();
            this.success(res, 'Connection pool statistics retrieved successfully.', stats);
        } catch (err) {
            this.badRequest(res, 'Failed to get connection pool statistics.');
            next(err);
        }
    };

    /** GET: Get enabled tools */
    public getEnabledTools = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tools = this.gatewayService.getEnabledTools();
            this.success(res, 'Enabled tools retrieved successfully.', tools);
        } catch (err) {
            this.badRequest(res, 'Failed to get enabled tools.');
            next(err);
        }
    };

    /** PUT: Update tool configuration */
    public updateToolConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { toolId } = req.params;
            const updates = req.body;
            
            const success = this.gatewayService.updateToolConfig(toolId, updates);
            if (!success) {
                return this.notFound(res, 'Tool not found.');
            }
            
            this.success(res, 'Tool configuration updated successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to update tool configuration.');
            next(err);
        }
    };

    /** POST: Reload gateway configuration */
    public reloadConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.gatewayService.reloadConfig();
            this.success(res, 'Gateway configuration reloaded successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to reload gateway configuration.');
            next(err);
        }
    };

    /** POST: Reset circuit breaker for a tool */
    public resetCircuitBreaker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { toolKey } = req.params;
            this.gatewayService.resetCircuitBreaker(toolKey);
            this.success(res, 'Circuit breaker reset successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to reset circuit breaker.');
            next(err);
        }
    };

    /** POST: Close all connections */
    public closeConnections = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.gatewayService.closeConnections();
            this.success(res, 'All connections closed successfully.');
        } catch (err) {
            this.badRequest(res, 'Failed to close connections.');
            next(err);
        }
    };
} 