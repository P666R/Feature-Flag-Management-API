import { createClient } from 'redis';
import { envConfig } from './env.config.js';
import { systemLogs as logger } from '../utils/logger.js';

const redisClient = createClient({
  url: envConfig.REDIS_URI,
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error', { error });
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

export default redisClient;
