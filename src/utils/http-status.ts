import { Response } from 'express';

interface response {
    success: boolean;
    message: string;
    data?: unknown;
    totalData?: number;
}

export class HttpStatus {

    /** Send success response */
    public success = (res: Response, message: string, data: unknown = null) => {
        const resObject: response = { success: true, message, data };
        res.status(200).json(resObject);
    };

    /** Send error response */
    public badRequest = (res: Response, message: string = 'Something went wrong, please try again later.', data: unknown = null) => {
        const resObject: response = { success: false, message, data };
        res.status(400).json(resObject);
    };

    /** Send unauthorized response */
    public unauthorized = (res: Response, message: string = 'User not authenticated.', data: unknown = null) => {
        const resObject: response = { success: false, message, data };
        res.status(401).json(resObject);
    };

    /** Send not found response */
    public notFound = (res: Response, message: string, data: unknown = null) => {
        const resObject: response = { success: false, message, data };
        res.status(404).json(resObject);
    };

    /** Send conflict error response */
    public conflict = (res: Response, message: string, data: unknown = null) => {
        const resObject: response = { success: false, message, data };
        res.status(409).json(resObject);
    };

    /** Send internal server error response */
    public serverError = (res: Response, message: string = 'Internal server error.', data: unknown = null) => {
        const resObject: response = { success: false, message, data };
        res.status(500).json(resObject);
    };
}