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

  /**
   * @swagger
   * /users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     security: [] # No auth required
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUser'
   *     responses:
   *       201:
   *         description: User created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid request data
   */
  router
    .route('/register')
    .post(
      createValidatorMiddleware(createUserDTOSchema),
      userController.register,
    );

  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: Login a user
   *     tags: [Users]
   *     security: [] # No auth required
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginUser'
   *     responses:
   *       200:
   *         description: User logged in
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *                 token:
   *                   type: string
   *       400:
   *         description: Invalid credentials
   */
  router
    .route('/login')
    .post(createValidatorMiddleware(loginUserDTOSchema), userController.login);

  // Protected routes
  router.use(authMiddleware);

  /**
   * @swagger
   * /users/me:
   *   get:
   *     summary: Get the current user's profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user's profile
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   */
  router.route('/me').get(userController.getMe);

  // Admin routes
  router.use(restrictTo('admin'));

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Retrieve all users (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                     users:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/User'
   *       403:
   *         description: Forbidden (not admin)
   */
  router.route('/').get(userController.getUsers);

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get a user by ID (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */
  router.route('/:id').get(userController.getUser);

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update a user (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUser'
   *     responses:
   *       200:
   *         description: User updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */
  router
    .route('/:id')
    .put(
      createValidatorMiddleware(updateUserDTOSchema),
      userController.updateUser,
    );

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete a user (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     responses:
   *       204:
   *         description: User deleted
   *       404:
   *         description: User not found
   */
  router.route('/:id').delete(userController.deleteUser);

  return router;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role
 *       required:
 *         - name
 *         - email
 *     CreateUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *       required:
 *         - name
 *         - email
 *         - password
 *     LoginUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *       required:
 *         - email
 *         - password
 *     UpdateUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role
 *       minProperties: 1
 */

export default createUserRouter;
