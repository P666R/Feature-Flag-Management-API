import dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';

dotenv.config();

// eslint-disable-next-line no-undef
export const envConfig = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: port({ default: 3000 }),
  MONGODB_URI: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str(),
  REDIS_URI: str({ default: 'redis://localhost:6379' }),
  API_BASE_URL: str({ default: 'http://localhost:3000/api/v1' }),
});
