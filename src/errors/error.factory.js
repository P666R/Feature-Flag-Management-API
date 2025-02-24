import { systemLogs } from '../utils/logger.js';
import { envConfig } from '../config/env.config.js';

const createErrorHandler = ({ logger = systemLogs, env = envConfig } = {}) => {
  // * Handle HTTP errors
  // eslint-disable-next-line no-unused-vars
  const handleHttpError = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isProduction = env.isProduction;

    // * Log error details
    logger.error(err.name || 'Error', {
      message: err.message,
      stack: isProduction ? undefined : err.stack, // * Hide stack in prod
      statusCode,
      method: req.method,
      path: req.path,
      details: err.details || {},
    });

    // * Send response
    res.status(statusCode).json({
      error: err.name || 'Internal Server Error',
      message: err.message || 'Something went wrong',
      ...(isProduction ? {} : { stack: err.stack, details: err.details }),
    });
  };

  // * Handle uncaught exceptions
  const handleUncaughtException = async (error) => {
    logger.error('Uncaught exception', {
      message: error.message,
      stack: error.stack,
    });
    return error; // * Return for shutdown handler
  };

  // * Handle unhandled promise rejections
  const handleUnhandledRejection = async (reason) => {
    logger.error('Unhandled promise rejection', {
      message: reason.message || 'Unknown reason',
      stack: reason.stack,
    });
    return reason; // * Return for shutdown handler
  };

  return {
    handleHttpError,
    handleUncaughtException,
    handleUnhandledRejection,
  };
};

export default createErrorHandler;
