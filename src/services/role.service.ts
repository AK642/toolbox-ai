import { Role, IRole } from '../models/role.model';

export class RoleService {
    public getAllRoles = async (isActive?: boolean, search?: string) => {
        const query: Record<string, unknown> = { isDeleted: false };
        if (typeof isActive === 'boolean') {
            query.isActive = isActive;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        return await Role.find(query);
    };

    public getRoleById = async (id: string) => {
        return await Role.findOne({ _id: id, isDeleted: false });
    };

    public createRole = async (data: Partial<IRole>) => {
        const exists = await Role.findOne({ name: { $regex: `^${data.name}$`, $options: 'i' }, isDeleted: false });
        if (exists) return { error: 'Role name must be unique.' };
        return await Role.create(data);
    };

    public updateRole = async (id: string, data: Partial<IRole>) => {
        if (data.name) {
            const exists = await Role.findOne({ _id: { $ne: id }, name: { $regex: `^${data.name}$`, $options: 'i' }, isDeleted: false });
            if (exists) return { error: 'Role name must be unique.' };
        }
        return await Role.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    };

    public deleteRole = async (id: string) => {
        return await Role.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
    };

    public getRolesPaginated = async (page: number, limit: number, search?: string, isActive?: boolean) => {
        const query: Record<string, unknown> = { isDeleted: false };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (typeof isActive === 'boolean') {
            query.isActive = isActive;
        }
        const roles = await Role.find(query)
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Role.countDocuments(query);
        return { roles, total, page, limit };
    };
} 