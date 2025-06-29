import Joi from 'joi';

export class RoleValidateSchema {
    /** Schema for creating a role */
    public createRoleSchema = Joi.object({
        name: Joi.string().max(255).required(),
        isActive: Joi.boolean().optional(),
        isDeleted: Joi.boolean().optional(),
    });

    /** Schema for updating a role */
    public updateRoleSchema = Joi.object({
        id: Joi.string().max(255).required(),
        name: Joi.string().max(255).optional(),
        isActive: Joi.boolean().optional(),
        isDeleted: Joi.boolean().optional(),
    });
} 