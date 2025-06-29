import { Router } from 'express';
import { AIToolsController } from '../controllers/ai-tools.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { SchemaMiddleware } from '../middleware/schema-validator.middleware';
import { AIToolsValidateSchema } from '../validations/ai-tools.validation';

export class AIToolsRoutes {
    public aiToolsController: AIToolsController = new AIToolsController();
    public authMiddleware: AuthMiddleware = new AuthMiddleware();
    public schemaMiddleware: SchemaMiddleware = new SchemaMiddleware();
    public aiToolsValidateSchema: AIToolsValidateSchema = new AIToolsValidateSchema();
    public router: Router = Router();

    constructor() {
        this.config();
    }

    private config(): void {
        this.router.get('/', this.authMiddleware.validateToken, this.aiToolsController.getAllAITools);
        this.router.get('/paginated', this.authMiddleware.validateToken, this.aiToolsController.getAIToolsPaginated);
        this.router.get('/:id', this.authMiddleware.validateToken, this.aiToolsController.getAIToolById);
        this.router.post('/',
            this.authMiddleware.validateToken,
            this.schemaMiddleware.validateSchema(this.aiToolsValidateSchema.createAIToolSchema),
            this.aiToolsController.createAITool
        );
        this.router.put('/:id',
            this.authMiddleware.validateToken,
            this.schemaMiddleware.validateSchema(this.aiToolsValidateSchema.updateAIToolSchema),
            this.aiToolsController.updateAITool
        );
        this.router.delete('/:id', this.authMiddleware.validateToken, this.aiToolsController.deleteAITool);
        this.router.post('/use-tool',
            this.authMiddleware.validateToken,
            this.aiToolsController.callAIToolService
        );
    }
} 