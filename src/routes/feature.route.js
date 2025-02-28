import express from 'express';
import createFeatureController from '../controllers/feature.controller.js';
import createAuthMiddleware from '../middleware/auth.middleware.js';
import createValidatorMiddleware from '../middleware/validator.middleware.js';
import {
  createFeatureDTOSchema,
  updateFeatureDTOSchema,
  toggleGroupDTOSchema,
} from '../dtos/feature.dto.js';

const createFeatureRouter = ({
  featureController = createFeatureController(),
} = {}) => {
  const { authMiddleware, restrictTo } = createAuthMiddleware();
  const router = express.Router();

  // * Apply authentication and authorization middleware
  router.use(authMiddleware);
  router.use(restrictTo('admin'));

  // * Routes with validation middleware
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

  router
    .route('/group/:groupName/toggle')
    .patch(
      createValidatorMiddleware(toggleGroupDTOSchema),
      featureController.toggleGroup,
    );

  return router;
};

export default createFeatureRouter;
