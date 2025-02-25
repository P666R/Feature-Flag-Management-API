import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import createUserRepository from '../repositories/user.repository.js';
import { systemLogs as logger } from '../utils/logger.js';
import { envConfig } from '../config/env.config.js';

const createAuthMiddleware = ({
  env = envConfig,
  userRepository = createUserRepository(),
} = {}) => {
  const authMiddleware = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedError('No token provided', { path: req.path });
      }

      const decoded = await promisify(jwt.verify)(token, env.JWT_SECRET);

      const user = await userRepository.findUserById(decoded.id);

      if (!user) {
        throw new UnauthorizedError('Invalid token');
      }

      req.user = {
        id: user.id,
        role: user.role,
      };

      logger.info('User authenticated', { id: user.id });
      next();
    } catch (error) {
      logger.error('Authentication failed', { error });
      next(
        error instanceof jwt.JsonWebTokenError
          ? new UnauthorizedError('Invalid token')
          : error,
      );
    }
  };

  const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError(
          'You do not have permission to perform this action',
        );
      }
      next();
    };
  };

  return {
    authMiddleware,
    restrictTo,
  };
};

export default createAuthMiddleware;
