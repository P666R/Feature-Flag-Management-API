import express from 'express';
import createUserController from '../controllers/user.controller.js';
import createAuthMiddleware from '../middlewares/auth.middleware.js';

const createUserRouter = ({ userController = createUserController() } = {}) => {
  const { authMiddleware, restrictTo } = createAuthMiddleware();
  const router = express.Router();

  // * Public routes
  router.route('/register').post(userController.register);
  router.route('/login').post(userController.login);

  // * Protected routes
  router.use(authMiddleware);
  router.route('/me').get(userController.getMe);

  // * Admin routes
  router.use(restrictTo('admin'));
  router.route('/').get(userController.getUsers);
  router
    .route('/:id')
    .get(userController.getUser)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

  return router;
};

export default createUserRouter;
