import { envConfig } from './config/env.config.js';
import createApp from './app.js';
import { systemLogs as logger } from './utils/logger.js';
import createMongoConnector from './config/db.mongo.js';
import { createErrorHandler } from './errors/index.js';
import redisClient from './config/db.redis.js';

// * MongoDB connection factory
const mongoConnectorFactory = createMongoConnector;

// * Server factory
const createServer = ({ app, port, env }) => ({
  start: () => {
    const server = app.listen(port, () => {
      logger.info(`Server running in ${env} mode on port ${port}`);
    });
    server.setTimeout(10000);
    return server;
  },
});

// * Shutdown handler factory
const createShutdownHandler = ({ server, mongoConnector }) => ({
  shutdown: (signal) => async () => {
    logger.info(`${signal} received, shutting down gracefully`);
    try {
      await server.close();
      logger.info('Server closed');
      await mongoConnector.disconnect();
      logger.info('MongoDB connection closed');
      await redisClient.disconnect();
      logger.info('Redis connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  },
});

// * Main application bootstrap
const bootstrap = async ({ mongoConnector, serverFactory, mongoUri }) => {
  if (!mongoUri) {
    logger.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const errorHandler = createErrorHandler({ env: envConfig });

  try {
    // * Connect to MongoDB with retry logic
    await (async (retries = 5, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          await mongoConnector.connect();
          return;
        } catch (error) {
          logger.error(`MongoDB connection attempt ${i + 1} failed`, { error });
          if (i === retries - 1) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    })();

    await redisClient.connect();
    const server = serverFactory.start();
    const shutdownHandler = createShutdownHandler({ server, mongoConnector });
    const shutdown = shutdownHandler.shutdown;

    process.on('SIGTERM', shutdown('SIGTERM'));
    process.on('SIGINT', shutdown('SIGINT'));
    process.on('uncaughtException', async (error) => {
      await errorHandler.handleUncaughtException(error);
      await shutdown('uncaughtException')();
    });
    process.on('unhandledRejection', async (reason) => {
      await errorHandler.handleUnhandledRejection(reason);
      await shutdown('unhandledRejection')();
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// * Dependency configuration
const initializeDependencies = () => {
  const app = createApp();
  const mongoConnector = mongoConnectorFactory({
    mongoUri: envConfig.MONGODB_URI,
  });
  const serverFactory = createServer({
    app,
    port: envConfig.PORT,
    env: envConfig.NODE_ENV,
  });

  return { mongoConnector, serverFactory, mongoUri: envConfig.MONGODB_URI };
};

// * Start the application
(async () => {
  const dependencies = initializeDependencies();
  await bootstrap(dependencies);
})();
