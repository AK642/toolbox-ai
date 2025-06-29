import { NextFunction, Request, Response } from 'express';
import errorHandler from '../errorHandler/errorHandler';
import { CustomError } from '../utils/interfaces';

/**Create middleware for error log */
export const errorMiddleware = (error: CustomError, request: Request, response: Response, next: NextFunction) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    
    // Format current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    console.error(`[${formattedDate}] ${error.stack}` || error.message);
    const url = `Location of Error : ${request.originalUrl}  Method : ${request.method}  Request Body : ${JSON.stringify(request.body)}`;
    errorHandler(error, url);
    if (response.headersSent) return next(error);
    response.status(status).send({ status, message, });
};
