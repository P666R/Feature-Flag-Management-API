import express from 'express';
import morgan from 'morgan';
import { envConfig } from './config/env.config.js';
import { morganMiddleware, systemLogs as logger } from './utils/logger.js';
import { errorMiddleware, NotFoundError } from './errors/index.js';
import createUserRouter from './routes/user.route.js';
import createIndexRouter from './routes/index.route.js';
import createFeatureRouter from './routes/feature.route.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// * Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Feature Flag Management API',
      version: '1.0.0',
      description: 'A simple API for managing feature flags and users',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }], // * Apply globally, overridden per route if needed
  },
  apis: ['./src/routes/*.js'], // * Include all route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

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

  // * Mount Swagger UI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
