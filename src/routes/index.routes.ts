import { Router } from 'express';
import { UserRoutes } from './user.routes';
import { RoleRoutes } from './role.routes';
import { AIToolsRoutes } from './ai-tools.routes';

export class Routes {
    public router = Router();

    // Create routes instances
    private userRoutes: UserRoutes = new UserRoutes();
    private roleRoutes: RoleRoutes = new RoleRoutes();
    private aiToolsRoutes: AIToolsRoutes = new AIToolsRoutes();

    constructor() {
        // Initialize routes
        this.router.use('/user', this.userRoutes.router);
        this.router.use('/role', this.roleRoutes.router);
        this.router.use('/ai-tools', this.aiToolsRoutes.router);
    }
}