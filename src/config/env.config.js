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
});
