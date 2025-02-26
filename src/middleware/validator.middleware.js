import { systemLogs as logger } from '../utils/logger.js';
import { ValidationError } from '../errors/index.js';

const createValidatorMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      logger.error('Request validation failed', {
        path: req.path,
        errors: error.errors,
      });
      next(
        new ValidationError('Invalid request data', { errors: error.errors }),
      );
    }
  };
};

export default createValidatorMiddleware;
