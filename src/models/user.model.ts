import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import { hashAsync } from '../utils/crypto-helper';

export interface IUser extends Document {
    roleId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    softDelete(): Promise<IUser>;
}

const userSchema = new Schema<IUser>({
    roleId: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255
    },
    phoneNumber: {
        type: String,
        required: true,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        maxlength: 255
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
    collection: 'users'
});

// Add soft delete functionality
userSchema.add({
    deletedAt: {
        type: Date,
        default: null
    }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            this.password = await hashAsync(this.password);
        } catch (error) {
            return next(error as CallbackError);
        }
    }
    next();
});

// Pre-update middleware to hash password
userSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate() as Record<string, unknown>;
    if (update.password) {
        try {
            update.password = await hashAsync(update.password as string);
        } catch (error) {
            return next(error as CallbackError);
        }
    }
    next();
});

// Soft delete method
userSchema.methods.softDelete = function() {
    this.deletedAt = new Date();
    return this.save();
};

export const User = mongoose.model<IUser>('User', userSchema);