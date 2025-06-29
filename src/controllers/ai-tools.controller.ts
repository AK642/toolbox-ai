import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../utils/http-status';
import { AIToolsService } from '../services/ai-tools.service';
import { callAITool } from '../gateway/ai-gateway';

export class AIToolsController extends HttpStatus {
    public aiToolsService: AIToolsService = new AIToolsService();

    /** GET: Get all AI tools */
    public getAllAITools = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isActiveParam = req.query.isActive;
            let isActive: boolean | undefined = undefined;
            if (isActiveParam === 'true') isActive = true;
            if (isActiveParam === 'false') isActive = false;
            const search = req.query.search as string | undefined;
            const aiTools = await this.aiToolsService.getAllAITools(isActive, search);
            this.success(res, 'AI Tools fetched successfully.', aiTools);
        } catch (err) {
            this.badRequest(res, 'Failed to fetch AI Tools.');
            next(err);
        }
    };

    /** GET: Get AI tools with pagination */
    public getAIToolsPaginated = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;
            const isActiveParam = req.query.isActive;
            let isActive: boolean | undefined = undefined;
            if (isActiveParam === 'true') isActive = true;
            if (isActiveParam === 'false') isActive = false;
            const result = await this.aiToolsService.getAIToolsPaginated(page, limit, search, isActive);
            this.success(res, 'AI Tools fetched successfully.', result);
        } catch (err) {
            this.badRequest(res, 'Failed to fetch paginated AI Tools.');
            next(err);
        }
    };

    /** GET: Get AI tool by ID */
    public getAIToolById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const aiTool = await this.aiToolsService.getAIToolById(req.params.id);
            if (!aiTool) return this.notFound(res, 'AI Tool not found.');
            this.success(res, 'AI Tool fetched successfully.', aiTool);
        } catch (err) {
            this.badRequest(res, 'Failed to fetch AI Tool.');
            next(err);
        }
    };

    /** POST: Create AI tool */
    public createAITool = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.aiToolsService.createAITool(req.body);
            if (hasError(result)) {
                return this.badRequest(res, result.error);
            }
            this.success(res, 'AI Tool created successfully.', result);
        } catch (err) {
            this.badRequest(res, 'Failed to create AI Tool.');
            next(err);
        }
    };

    /** PUT: Update AI tool */
    public updateAITool = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.aiToolsService.updateAITool(req.params.id, req.body);
            if (hasError(result)) {
                return this.badRequest(res, result.error);
            }
            if (!result) return this.notFound(res, 'AI Tool not found.');
            this.success(res, 'AI Tool updated successfully.', result);
        } catch (err) {
            this.badRequest(res, 'Failed to update AI Tool.');
            next(err);
        }
    };

    /** DELETE: Delete AI tool */
    public deleteAITool = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const aiTool = await this.aiToolsService.deleteAITool(req.params.id);
            if (!aiTool) return this.notFound(res, 'AI Tool not found.');
            this.success(res, 'AI Tool deleted successfully.', aiTool);
        } catch (err) {
            this.badRequest(res, 'Failed to delete AI Tool.');
            next(err);
        }
    };

    /** POST: Proxy user message to AI tool service */
    public callAIToolService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { toolId, message } = req.body;
            // Extend Request type to include user
            type UserRequest = Request & { user?: { id?: string } };
            const userReq = req as UserRequest;
            const userId = userReq.user?.id || 'test-user';
            // Stub: check user credits (replace with real logic)
            const hasCredits = true; // TODO: implement real credit check
            if (!hasCredits) return this.badRequest(res, 'Insufficient credits.');
            // Call the gateway
            const aiResponse = await callAITool(toolId, message, userId);
            // Stub: deduct credit (replace with real logic)
            // ...
            this.success(res, 'AI Tool response received.', { response: aiResponse });
        } catch (err) {
            this.badRequest(res, 'Failed to call AI Tool service.');
            next(err);
        }
    };
}

function hasError(obj: unknown): obj is { error: string } {
    return typeof obj === 'object' && obj !== null && 'error' in obj;
} 