import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../utils/http-status';
import { UserService } from '../services/user.service';
import { UserValidateSchema } from '../validations/user.validation';
import { encrypt } from '../utils/crypto-helper';

export class UserController extends HttpStatus {
    public userService: UserService = new UserService();
    public userValidateSchema: UserValidateSchema = new UserValidateSchema();
    
    /** GET API: get all users */
    public getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get all users
            const users = await this.userService.getAllUsers();
            if (!users.length) return this.notFound(res, 'Users not found.', users);

            this.success(res, 'Users get successfully.', users);
        } catch (err) {
            if (err instanceof Error) {
                this.badRequest(res, err.message);
                next(err);
            }
        }
    };

    /** POST API: login */
    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error } = this.userValidateSchema.loginSchema.validate(req.body);
            if (error) return this.badRequest(res, error.details[0].message);

            const { email, password } = req.body;
            const user = await this.userService.login(email, password);
            if (!user) return this.unauthorized(res, 'Invalid email or password.');

            const token = encrypt({ id: user._id, email: user.email, roleId: user.roleId });
            this.success(res, 'Login successful.', { token, user });
        } catch (err) {
            if (err instanceof Error) {
                this.badRequest(res, err.message);
                next(err);
            }
        }
    };
}