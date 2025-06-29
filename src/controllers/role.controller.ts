import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../utils/http-status';
import { RoleService } from '../services/role.service';

export class RoleController extends HttpStatus {
    public roleService: RoleService = new RoleService();

    /** GET: Get all roles */
    public getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isActiveParam = req.query.isActive;
            let isActive: boolean | undefined = undefined;
            if (isActiveParam === 'true') isActive = true;
            if (isActiveParam === 'false') isActive = false;
            const search = req.query.search as string | undefined;
            const roles = await this.roleService.getAllRoles(isActive, search);
            this.success(res, 'Roles fetched successfully.', roles);
        } catch (err) {
            this.badRequest(res, 'Failed to fetch roles.');
            next(err);
        }
    };

    /** GET: Get role by ID */
    public getRoleById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = await this.roleService.getRoleById(req.params.id);
            if (!role) return this.notFound(res, 'Role not found.');
            this.success(res, 'Role fetched successfully.', role);
        } catch (err) {
            this.badRequest(res, 'Failed to fetch role.');
            next(err);
        }
    };

    /** POST: Create role */
    public createRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.roleService.createRole(req.body);
            if (hasError(result)) {
                return this.badRequest(res, result.error);
            }
            this.success(res, 'Role created successfully.', result);
        } catch (err) {
            this.badRequest(res, 'Failed to create role.');
            next(err);
        }
    };

    /** PUT: Update role */
    public updateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.roleService.updateRole(req.params.id, req.body);
            if (hasError(result)) {
                return this.badRequest(res, result.error);
            }
            if (!result) return this.notFound(res, 'Role not found.');
            this.success(res, 'Role updated successfully.', result);
        } catch (err) {
            this.badRequest(res, 'Failed to update role.');
            next(err);
        }
    };

    /** DELETE: Delete role */
    public deleteRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = await this.roleService.deleteRole(req.params.id);
            if (!role) return this.notFound(res, 'Role not found.');
            this.success(res, 'Role deleted successfully.', role);
        } catch (err) {
            this.badRequest(res, 'Failed to delete role.');
            next(err);
        }
    };

    /** GET: Get roles with pagination */
    public getRolesPaginated = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;
            const isActiveParam = req.query.isActive;
            let isActive: boolean | undefined = undefined;
            if (isActiveParam === 'true') isActive = true;
            if (isActiveParam === 'false') isActive = false;
            const result = await this.roleService.getRolesPaginated(page, limit, search, isActive);
            this.success(res, 'Roles fetched successfully.', result);
        } catch (err) {
            this.badRequest(res, 'Failed to fetch paginated roles.');
            next(err);
        }
    };
}

function hasError(obj: unknown): obj is { error: string } {
    return typeof obj === 'object' && obj !== null && 'error' in obj;
} 