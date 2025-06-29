import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../utils/http-status';
import { User } from '../models/user.model';
import { verifyToken } from '../utils/crypto-helper';
import { JwtPayload } from 'jsonwebtoken';

export class AuthMiddleware extends HttpStatus {

    /**  Middleware function to validate an authentication token */
    public validateToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get the token from the request header
            const token = req.header('access-token');
            if (!token) {
                return this.unauthorized(res, 'Invalid token.');
            }

            //  Verify the token
            const decodeData: JwtPayload | null = verifyToken(token);
            if (!decodeData) {
                return this.unauthorized(res, 'Invalid token.');
            }

            // Get the user based on the decoded token data (Mongoose)
            const user = await User.findById(decodeData.id);
            if (!user || !user.isActive || user.isDeleted) {
                return this.unauthorized(res, 'Invalid token.');
            }

            // Store authentication details in res.locals for downstream use
            res.locals.auth = {
                success: true,
                message: 'Valid token.',
                data: user,
                tokenData: decodeData,
                userId: user.id,
            };

            next();
        } catch (err) {
            if (err instanceof Error) {
                console.log('err: ', err);
                this.unauthorized(res, 'Invalid token.');
                next(err);
            }
        }
    };
}