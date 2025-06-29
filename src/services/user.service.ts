import { User } from '../models/user.model';
import { compareAsync } from '../utils/crypto-helper';

export class UserService {

    /** Get all users */
    public getAllUsers = async () => {
        return await User.find({ deletedAt: null });
    };

    /** Login user */
    public login = async (email: string, password: string) => {
        const user = await User.findOne({ email, isActive: true, isDeleted: false });
        if (!user) return null;
        const isMatch = await compareAsync(password, user.password);
        if (!isMatch) return null;
        return user;
    };
}