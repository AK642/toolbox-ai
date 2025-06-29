import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { SchemaMiddleware } from '../middleware/schema-validator.middleware';
import { RoleValidateSchema } from '../validations/role.validation';

export class RoleRoutes {
    public roleController: RoleController = new RoleController();
    public authMiddleware: AuthMiddleware = new AuthMiddleware();
    public schemaMiddleware: SchemaMiddleware = new SchemaMiddleware();
    public roleValidateSchema: RoleValidateSchema = new RoleValidateSchema();
    public router: Router = Router();

    constructor() {
        this.config();
    }

    private config(): void {
        this.router.get('/', this.authMiddleware.validateToken, this.roleController.getAllRoles);
        this.router.get('/paginated', this.authMiddleware.validateToken, this.roleController.getRolesPaginated);
        this.router.get('/:id', this.authMiddleware.validateToken, this.roleController.getRoleById);
        this.router.post('/',
            this.authMiddleware.validateToken,
            this.schemaMiddleware.validateSchema(this.roleValidateSchema.createRoleSchema),
            this.roleController.createRole
        );
        this.router.put('/:id',
            this.authMiddleware.validateToken,
            this.schemaMiddleware.validateSchema(this.roleValidateSchema.updateRoleSchema),
            this.roleController.updateRole
        );
        this.router.delete('/:id', this.authMiddleware.validateToken, this.roleController.deleteRole);
    }
} 