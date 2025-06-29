import 'dotenv/config';
import { seedRoles } from './seedRoles';
import { seedAdminUser } from './seedAdminUser';

async function runSeeders() {
  try {
    await seedRoles();
    await seedAdminUser();
    console.log('All seeders executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error running seeders:', err);
    process.exit(1);
  }
}

runSeeders(); 