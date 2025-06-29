import { Router } from 'express';
import { GatewayController } from '../controllers/gateway.controller';

const router = Router();
const gatewayController = new GatewayController();

// Health and monitoring routes
router.get('/health', gatewayController.getHealthStatus);
router.get('/metrics', gatewayController.getMetrics);
router.get('/circuit-breaker/stats', gatewayController.getCircuitBreakerStats);
router.get('/connection-pool/stats', gatewayController.getConnectionPoolStats);
router.get('/tools/enabled', gatewayController.getEnabledTools);

// Management routes
router.put('/tools/:toolId/config', gatewayController.updateToolConfig);
router.post('/config/reload', gatewayController.reloadConfig);
router.post('/circuit-breaker/:toolKey/reset', gatewayController.resetCircuitBreaker);
router.post('/connections/close', gatewayController.closeConnections);

export default router; 