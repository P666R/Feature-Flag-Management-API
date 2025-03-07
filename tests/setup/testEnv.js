import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import redisMock from 'redis-mock';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { envConfig } from '../../src/config/env.config.js';

// * Mock Redis globally
vi.mock('redis', () => redisMock);

// * Setup MongoDB in-memory server
let mongod;

beforeAll(async () => {
  if (envConfig.isTest) {
    mongod = await MongoMemoryServer.create();
    // * Override for tests
    process.env.MONGODB_URI = mongod.getUri();
  }
});

afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
});

// * Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
