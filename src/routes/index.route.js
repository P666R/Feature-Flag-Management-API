import express from 'express';
import { systemLogs as logger } from '../utils/logger.js';

const createIndexRouter = () => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    try {
      logger.info('GET / request received');
      res.status(200).json({
        data: { message: 'Welcome to the Feature Flag Management API' },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createIndexRouter;
