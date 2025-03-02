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

  // Public endpoint for checking feature status (authenticated users)
  router.get(
    '/:name/enabled',
    authMiddleware,
    featureController.isFeatureEnabled,
  );

  // Admin-only routes
  router.use(authMiddleware);
  router.use(restrictTo('admin'));

  router
    .route('/')
    .get(featureController.getAllFeatures)
    .post(
      createValidatorMiddleware(createFeatureDTOSchema),
      featureController.createFeature,
    );

  router
    .route('/:id')
    .get(featureController.getFeature)
    .put(
      createValidatorMiddleware(updateFeatureDTOSchema),
      featureController.updateFeature,
    )
    .delete(featureController.deleteFeature);

  return router;
};

export default createFeatureRouter;
