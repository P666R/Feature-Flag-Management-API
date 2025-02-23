import { envConfig } from './config/env.config.js';
import createApp from './app.js';
import { systemLogs } from './utils/logger.js';
import createMongoConnector from './config/db.mongo.js';

// * MongoDB connection factory
const mongoConnectorFactory = createMongoConnector;

// * Server factory
const createServer = ({ app, port, logger, env }) => ({
  start: () => {
    const server = app.listen(port, () => {
      logger.info(`Server is running in ${env} mode on port ${port}`);
    });
    server.setTimeout(10000);
    return server;
  },
});

// * Shutdown handler factory
const createShutdownHandler = ({ server, logger, mongoConnector }) => ({
  shutdown: (signal) => async () => {
    logger.info(`${signal} received, shutting down gracefully`);
    try {
      await server.close();
      logger.info('Server closed');
      await mongoConnector.disconnect();
      logger.info('MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', err);
      process.exit(1);
    }
  },
});

// * Main application bootstrap
const bootstrap = async (deps) => {
  const { logger, mongoConnector, serverFactory, mongoUri } = deps;

  if (!mongoUri) {
    logger.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  try {
    // * Connect to MongoDB with retry logic
    await (async (retries = 5, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          await mongoConnector.connect();
          return;
        } catch (error) {
          logger.error(`MongoDB connection attempt ${i + 1} failed`, error);
          if (i === retries - 1) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    })();

    // * Start server
    const server = serverFactory.start();

    // * Create shutdown handler
    const shutdownHandler = createShutdownHandler({
      server,
      logger,
      mongoConnector,
    });
    const shutdown = shutdownHandler.shutdown;

    // * Process event handlers
    process.on('SIGTERM', shutdown('SIGTERM'));
    process.on('SIGINT', shutdown('SIGINT'));

    process.on('uncaughtException', async (error) => {
      logger.error('Uncaught exception', error);
      await shutdown('uncaughtException')();
    });
    process.on('unhandledRejection', async (error) => {
      logger.error('Unhandled promise rejection', error);
      await shutdown('unhandledRejection')();
    });
  } catch (error) {
    logger.error('Failed to start the server', error);
    process.exit(1);
  }
};

// * Dependency configuration
const initializeDependencies = () => {
  // * Shared base dependencies
  const baseDeps = {
    logger: systemLogs,
    env: envConfig.NODE_ENV,
    mongoUri: envConfig.MONGODB_URI,
  };

  // * App specific dependencies
  const app = createApp({ logger: baseDeps.logger, env: envConfig });

  // * MongoDB specific dependencies
  const mongoDeps = {
    logger: baseDeps.logger,
    mongoUri: baseDeps.mongoUri,
  };
  const mongoConnector = mongoConnectorFactory(mongoDeps);

  // * Server specific dependencies
  const serverDeps = {
    app,
    port: envConfig.PORT,
    logger: baseDeps.logger,
    env: baseDeps.env,
  };
  const serverFactory = createServer(serverDeps);

  // * Return only what bootstrap needs
  return {
    logger: baseDeps.logger,
    mongoConnector,
    serverFactory,
    mongoUri: baseDeps.mongoUri,
  };
};

// * Start the application
(async () => {
  const dependencies = initializeDependencies();
  await bootstrap(dependencies);
})();
