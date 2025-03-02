import express from 'express';
import { systemLogs as logger } from '../utils/logger.js';

const createIndexRouter = () => {
  const router = express.Router();

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Welcome message for the API
   *     tags: [Index]
   *     security: [] # No auth required
   *     responses:
   *       200:
   *         description: Welcome message
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Welcome to the Feature Flag Management API
   */
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
