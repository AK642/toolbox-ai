import { AITool, IAITool } from '../models/ai-tools.model';

export class AIToolsService {
    public getAllAITools = async (isActive?: boolean, search?: string) => {
        const query: Record<string, unknown> = { isDeleted: false };
        if (typeof isActive === 'boolean') {
            query.isActive = isActive;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        return await AITool.find(query);
    };

    public getAIToolsPaginated = async (page: number, limit: number, search?: string, isActive?: boolean) => {
        const query: Record<string, unknown> = { isDeleted: false };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (typeof isActive === 'boolean') {
            query.isActive = isActive;
        }
        const aiTools = await AITool.find(query)
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await AITool.countDocuments(query);
        return { aiTools, total, page, limit };
    };

    public getAIToolById = async (id: string) => {
        return await AITool.findOne({ _id: id, isDeleted: false });
    };

    public createAITool = async (data: Partial<IAITool>) => {
        const exists = await AITool.findOne({ name: { $regex: `^${data.name}$`, $options: 'i' }, isDeleted: false });
        if (exists) return { error: 'AI Tool name must be unique.' };
        return await AITool.create(data);
    };

    public updateAITool = async (id: string, data: Partial<IAITool>) => {
        if (data.name) {
            const exists = await AITool.findOne({ _id: { $ne: id }, name: { $regex: `^${data.name}$`, $options: 'i' }, isDeleted: false });
            if (exists) return { error: 'AI Tool name must be unique.' };
        }
        return await AITool.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    };

    public deleteAITool = async (id: string) => {
        return await AITool.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
    };
} 