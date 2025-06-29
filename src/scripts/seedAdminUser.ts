import mongoose from 'mongoose';
import { config } from '../config/config';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

const envName = process.env.NODE_ENV || 'development';
const mongoUri = config[envName].uri;

const adminData = {
  name: 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  phoneNumber: process.env.ADMIN_PHONE || '1234567890',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  isActive: true,
  isDeleted: false
};

export async function seedAdminUser() {
  try {
    await mongoose.connect(mongoUri);
    const adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      throw new Error('Admin role not found. Please seed roles first.');
    }
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists.');
    } else {
      await User.create({ ...adminData, roleId: adminRole._id });
      console.log('Admin user created.');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  } finally {
    await mongoose.disconnect();
  }
} 