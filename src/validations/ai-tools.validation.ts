import Joi from 'joi';

export class AIToolsValidateSchema {
    /** Schema for creating an AI tool */
    public createAIToolSchema = Joi.object({
        name: Joi.string().max(255).required(),
        isActive: Joi.boolean().optional(),
        isDeleted: Joi.boolean().optional(),
    });

    /** Schema for updating an AI tool */
    public updateAIToolSchema = Joi.object({
        id: Joi.string().max(255).required(),
        name: Joi.string().max(255).optional(),
        isActive: Joi.boolean().optional(),
        isDeleted: Joi.boolean().optional(),
    });
} 