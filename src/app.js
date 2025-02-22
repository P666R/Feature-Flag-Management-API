const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const connectDB = require('./config/database');
const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const flagRoutes = require('./routes/flagRoutes');
const userRoutes = require('./routes/userRoutes');

// Create Express app
const createApp = () => {
  const app = express();

  // Load Swagger docs
  const swaggerDocument = YAML.load(
    path.join(__dirname, './swagger/swagger.yaml')
  );

  // Middleware
  app.use(express.json());
  app.use(helmet());
  app.use(cors());
  app.use(rateLimiter);

  // Logging middleware (only in development)
  if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Mount routers
  app.use('/api/auth', authRoutes);
  app.use('/api/flags', flagRoutes);
  app.use('/api/users', userRoutes);

  // Serve Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Base route
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to Feature Flag Management API',
      documentation: '/api-docs',
    });
  });

  // 404 handler
  app.all('*', (req, res, next) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.originalUrl} not found`,
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

// Start the server
const startServer = async (app, port, connectDB, logger) => {
  try {
    // Connect to the database
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${port}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

// Initialize the app and start the server
const app = createApp();
startServer(app, config.PORT, connectDB, logger);

module.exports = { createApp, startServer };
