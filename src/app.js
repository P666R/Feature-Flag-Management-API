import express from 'express';
import morgan from 'morgan';
import { envConfig } from './config/env.config.js';
import { morganMiddleware, systemLogs } from './utils/logger.js';
import { errorMiddleware, NotFoundError } from './errors/index.js';

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

  // Catch-all route for unmatched URLs
  app.all('*', (req, res, next) => {
    next(
      new NotFoundError('Route not found', {
        method: req.method,
        path: req.path,
      }),
    );
  });

  // * Error handling middleware
  app.use(errorMiddleware({ logger, env }));

  return app;
};

export default createApp;
