import Joi from 'joi';

export class UserValidateSchema {

    /** Schema for validating the request body when get all a user */
    public getUserSchema = Joi.object({
        search: Joi.string().optional(),
        pageIndex: Joi.string().optional(),
        pageSize: Joi.string().optional(),
        sortColumn: Joi.string().optional(),
        sortDirection: Joi.string().optional(),
    });

    /** Schema for validating the request body when logging in */
    public loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
}