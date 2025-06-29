import mongoose from 'mongoose';
import { Role } from '../models/role.model';
import { config } from '../config/config';

const roles = [
  { name: 'User', isActive: true, isDeleted: false },
  { name: 'Admin', isActive: true, isDeleted: false },
  { name: 'Super Admin', isActive: true, isDeleted: false }
];

const env = process.env.NODE_ENV || 'development';
const mongoUri = config[env].uri;

export async function seedRoles() {
  try {
    await mongoose.connect(mongoUri);
    for (const role of roles) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
        console.log(`Role '${role.name}' created.`);
      } else {
        console.log(`Role '${role.name}' already exists.`);
      }
    }
  } catch (err) {
    console.error('Error seeding roles:', err);
  } finally {
    await mongoose.disconnect();
  }
} 