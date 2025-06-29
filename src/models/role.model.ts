import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
    name: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const roleSchema = new Schema<IRole>({
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
    collection: 'roles'
});

export const Role = mongoose.model<IRole>('Role', roleSchema); 