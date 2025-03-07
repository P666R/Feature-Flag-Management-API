import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { envConfig } from './env.config.js';

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
        url: envConfig.API_BASE_URL,
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
    // * Apply globally, overridden per route if needed
    security: [{ bearerAuth: [] }],
  },
  // * Include all route files
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerSpec, swaggerUi };
