import mongoose, { Document, Schema } from 'mongoose';

export interface IAITool extends Document {
    name: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const aiToolSchema = new Schema<IAITool>({
    name: {
        type: String,
        required: true,
        maxlength: 255,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'ai_tools'
});

export const AITool = mongoose.model<IAITool>('AITool', aiToolSchema); 