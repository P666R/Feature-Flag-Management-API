import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';

import globalLimiter from './utils/rateLimiter.js';
import { envConfig } from './config/env.config.js';
import { errorMiddleware, NotFoundError } from './errors/index.js';
import { swaggerSpec, swaggerUi } from './config/swagger.config.js';
import { morganMiddleware, systemLogs as logger } from './utils/logger.js';

import createUserRouter from './routes/user.route.js';
import createIndexRouter from './routes/index.route.js';
import createFeatureRouter from './routes/feature.route.js';

// * Factory function to create the Express app
const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(globalLimiter(100, 'API'));
  app.use(express.json());
  app.use(morganMiddleware);

  if (envConfig.isDevelopment) {
    app.use(
      morgan('dev', {
        stream: { write: (message) => logger.debug(message.trim()) },
      }),
    );
  }

  // * Mount Swagger UI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api/v1', createIndexRouter());
  app.use('/api/v1/users', createUserRouter());
  app.use('/api/v1/flags', createFeatureRouter());

  // * 404 error handler
  app.all('*', (req, res, next) => {
    next(
      new NotFoundError('Route not found', {
        method: req.method,
        path: req.path,
      }),
    );
  });

  // * Global error handler
  app.use(errorMiddleware({ env: envConfig }));

  return app;
};

export default createApp;
