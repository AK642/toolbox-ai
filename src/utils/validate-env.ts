import { cleanEnv } from 'envalid';
import { port, str } from 'envalid/dist/validators';

export default cleanEnv(process.env, {
    // Server Environment
    NODE_ENV: str(),

    // API Port
    PORT: port(),

    API_URL: str(),

    // Database Configuration
    MONGODB_URI: str(),

    SECRET_KEY: str(),
});