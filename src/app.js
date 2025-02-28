import express from 'express';
import morgan from 'morgan';
import { envConfig } from './config/env.config.js';
import { morganMiddleware, systemLogs as logger } from './utils/logger.js';
import { errorMiddleware, NotFoundError } from './errors/index.js';
import createUserRouter from './routes/user.route.js';
import createIndexRouter from './routes/index.route.js';
import createFeatureRouter from './routes/feature.route.js';

// * Factory function to create the Express app
const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(morganMiddleware);

  if (envConfig.isDevelopment) {
    app.use(
      morgan('dev', {
        stream: { write: (message) => logger.debug(message.trim()) },
      }),
    );
  }

  app.use('/api/v1', createIndexRouter());
  app.use('/api/v1/users', createUserRouter());
  app.use('/api/v1/flags', createFeatureRouter());

  app.all('*', (req, res, next) => {
    next(
      new NotFoundError('Route not found', {
        method: req.method,
        path: req.path,
      }),
    );
  });

  app.use(errorMiddleware({ env: envConfig }));

  return app;
};

export default createApp;
