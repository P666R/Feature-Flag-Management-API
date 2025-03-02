import express from 'express';
import createFeatureController from '../controllers/feature.controller.js';
import createAuthMiddleware from '../middleware/auth.middleware.js';
import createValidatorMiddleware from '../middleware/validator.middleware.js';
import {
  createFeatureDTOSchema,
  updateFeatureDTOSchema,
} from '../dtos/feature.dto.js';

const createFeatureRouter = ({
  featureController = createFeatureController(),
} = {}) => {
  const { authMiddleware, restrictTo } = createAuthMiddleware();
  const router = express.Router();

  /**
   * @swagger
   * /flags/{name}/enabled:
   *   get:
   *     summary: Check if a feature is enabled
   *     tags: [Features]
   *     parameters:
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *         description: The name of the feature
   *     responses:
   *       200:
   *         description: Feature enabled status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     enabled:
   *                       type: boolean
   *       404:
   *         description: Feature not found
   */
  router.get(
    '/:name/enabled',
    authMiddleware,
    featureController.isFeatureEnabled,
  );

  // Admin-only routes
  router.use(authMiddleware);
  router.use(restrictTo('admin'));

  /**
   * @swagger
   * /flags:
   *   get:
   *     summary: Retrieve all features
   *     tags: [Features]
   *     responses:
   *       200:
   *         description: List of all features
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
   *                     features:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Feature'
   */
  router.route('/').get(featureController.getAllFeatures);

  /**
   * @swagger
   * /flags:
   *   post:
   *     summary: Create a new feature
   *     tags: [Features]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateFeature'
   *     responses:
   *       201:
   *         description: Feature created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Feature'
   *       403:
   *         description: Feature name already exists
   */
  router
    .route('/')
    .post(
      createValidatorMiddleware(createFeatureDTOSchema),
      featureController.createFeature,
    );

  /**
   * @swagger
   * /flags/{id}:
   *   get:
   *     summary: Get a feature by ID
   *     tags: [Features]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The feature ID
   *     responses:
   *       200:
   *         description: Feature details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Feature'
   *       404:
   *         description: Feature not found
   */
  router.route('/:id').get(featureController.getFeature);

  /**
   * @swagger
   * /flags/{id}:
   *   put:
   *     summary: Update a feature
   *     tags: [Features]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The feature ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateFeature'
   *     responses:
   *       200:
   *         description: Feature updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Feature'
   *       404:
   *         description: Feature not found
   */
  router
    .route('/:id')
    .put(
      createValidatorMiddleware(updateFeatureDTOSchema),
      featureController.updateFeature,
    );

  /**
   * @swagger
   * /flags/{id}:
   *   delete:
   *     summary: Delete a feature
   *     tags: [Features]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The feature ID
   *     responses:
   *       204:
   *         description: Feature deleted
   *       404:
   *         description: Feature not found
   */
  router.route('/:id').delete(featureController.deleteFeature);

  return router;
};

// Define Swagger components
/**
 * @swagger
 * components:
 *   schemas:
 *     Feature:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the feature
 *         name:
 *           type: string
 *           description: Unique name of the feature
 *         enabled:
 *           type: boolean
 *           description: Whether the feature is enabled
 *         description:
 *           type: string
 *           description: Description of the feature
 *       required:
 *         - name
 *         - description
 *     CreateFeature:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Unique name of the feature
 *         enabled:
 *           type: boolean
 *           default: false
 *           description: Whether the feature is enabled
 *         description:
 *           type: string
 *           description: Description of the feature
 *       required:
 *         - name
 *         - description
 *     UpdateFeature:
 *       type: object
 *       properties:
 *         enabled:
 *           type: boolean
 *           description: Whether the feature is enabled
 *         description:
 *           type: string
 *           description: Description of the feature
 *       minProperties: 1
 */

export default createFeatureRouter;
