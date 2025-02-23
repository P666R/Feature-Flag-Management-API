import express from 'express';
import morgan from 'morgan';
import { envConfig } from './config/env.config.js';
import { morganMiddleware, systemLogs } from './utils/logger.js';

// * Factory function to create the Express app with dependency injection
const createApp = ({ logger = systemLogs, env = envConfig } = {}) => {
  const app = express();

  // * Middleware setup
  app.use(express.json());
  app.use(morganMiddleware);

  if (env.isDevelopment) {
    app.use(
      morgan('dev', {
        stream: {
          write: (message) => logger.debug(message.trim()), // * Log as debug to align with Winston levels
        },
      }),
    );
  }

  // * Routes
  app.get('/', (req, res) => {
    logger.info('GET / request received');
    res.status(200).json({ message: 'Hello World' });
  });

  return app;
};

export default createApp;
