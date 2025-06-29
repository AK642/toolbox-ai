import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../utils/http-status';
import { Schema } from 'joi';

export class SchemaMiddleware extends HttpStatus {

    /** Validate schemas and handle missing params */
    public validateSchema = (schema: Schema) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                // Merge `req.body`, `req.params`, and `req.query` into a single object for validation
                let dataToValidate = {
                    ...req.params,
                    ...req.body,
                    ...req.query
                };

                // Parse JSON fields (e.g., `objParam`) if they exist and are strings
                if (dataToValidate.objParam && typeof dataToValidate.objParam === 'string') {
                    try {
                        const parsedObjParam = JSON.parse(dataToValidate.objParam);

                        // Ensure `id` is included inside the parsed `objParam` if it's present in `req.params` or `req.body`
                        if (dataToValidate.id) {
                            parsedObjParam.id = dataToValidate.id;
                        }

                        dataToValidate = {
                            ...parsedObjParam // Overwrite objParam with the parsed object
                        };
                    } catch (error) {
                        this.badRequest(res, 'Invalid JSON format in objParam.', error);
                        return;
                    }
                }

                // Validate the merged data object using the provided schema
                const { error } = schema.validate(dataToValidate, { abortEarly: false });

                if (error) {
                    // Extract detailed error messages for each validation issue
                    const errors = error.details.map((detail) => ({
                        message: detail.message,
                        path: detail.path.join('.'),
                    }));
                    this.badRequest(res, 'Incorrect or missing parameters.', errors);
                    return;
                }

                // If validation passes, move to the next middleware
                next();
            } catch (err) {
                // Catch any unexpected errors and send a response
                if (err instanceof Error) {
                    this.badRequest(res, 'Validation failed due to an unexpected error.', [
                        { message: err.message, path: 'unknown' }
                    ]);
                }
                next(err);
            }
        };
    };
}