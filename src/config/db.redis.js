import { createClient } from 'redis';
import { envConfig } from './env.config.js';
import { systemLogs as logger } from './utils/logger.js';

const createRedisClient = () => {
  const client = createClient({
    url: envConfig.REDIS_URI,
  });

  client.on('error', (error) => {
    logger.error('Redis connection error', { error });
  });
  client.on('connect', () => {
    logger.info('Connected to Redis');
  });

  return client;
};

const redisClientInstance = createRedisClient();
export default () => redisClientInstance;
