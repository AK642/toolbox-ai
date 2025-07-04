import { Router } from 'express';
import { UserRoutes } from './user.routes';
import { RoleRoutes } from './role.routes';
import { AIToolsRoutes } from './ai-tools.routes';
import gatewayRoutes from './gateway.routes';
import queueRoutes from './queue.routes';
import socketRoutes from './socket.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Create route instances
const userRoutes = new UserRoutes();
const roleRoutes = new RoleRoutes();
const aiToolsRoutes = new AIToolsRoutes();

// API routes
router.use('/users', userRoutes.router);
router.use('/roles', roleRoutes.router);
router.use('/ai-tools', aiToolsRoutes.router);
router.use('/gateway', gatewayRoutes);
router.use('/queue', queueRoutes);
router.use('/socket', socketRoutes);

export default router;