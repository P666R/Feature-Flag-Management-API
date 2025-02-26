import express from 'express';
import createUserController from '../controllers/user.controller.js';
import createAuthMiddleware from '../middleware/auth.middleware.js';
import createValidatorMiddleware from '../middleware/validator.middleware.js';
import {
  createUserDTOSchema,
  loginUserDTOSchema,
  updateUserDTOSchema,
} from '../dtos/user.dto.js';

const createUserRouter = ({ userController = createUserController() } = {}) => {
  const { authMiddleware, restrictTo } = createAuthMiddleware();
  const router = express.Router();

  // * Public routes with validation
  router
    .route('/register')
    .post(
      createValidatorMiddleware(createUserDTOSchema),
      userController.register,
    );
  router
    .route('/login')
    .post(createValidatorMiddleware(loginUserDTOSchema), userController.login);

  // * Protected routes
  router.use(authMiddleware);
  router.route('/me').get(userController.getMe);

  // * Admin routes
  router.use(restrictTo('admin'));
  router.route('/').get(userController.getUsers);
  router
    .route('/:id')
    .get(userController.getUser)
    .put(
      createValidatorMiddleware(updateUserDTOSchema),
      userController.updateUser,
    )
    .delete(userController.deleteUser);

  return router;
};

export default createUserRouter;
