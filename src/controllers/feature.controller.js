import createFeatureService from '../services/feature.service.js';

const createFeatureController = ({
  featureService = createFeatureService(),
} = {}) => {
  const createFeature = async (req, res, next) => {
    try {
      const feature = await featureService.createFeature(req.body);
      res.status(201).json({ data: feature });
    } catch (error) {
      next(error);
    }
  };

  const getAllFeatures = async (req, res, next) => {
    try {
      const { count, features } = await featureService.getAllFeatures();
      res.status(200).json({ data: { count, features } });
    } catch (error) {
      next(error);
    }
  };

  const getFeature = async (req, res, next) => {
    try {
      const feature = await featureService.getFeatureById(req.params.id);
      res.status(200).json({ data: feature });
    } catch (error) {
      next(error);
    }
  };

  const updateFeature = async (req, res, next) => {
    try {
      const feature = await featureService.updateFeature(
        req.params.id,
        req.body,
      );
      res.status(200).json({ data: feature });
    } catch (error) {
      next(error);
    }
  };

  const deleteFeature = async (req, res, next) => {
    try {
      await featureService.deleteFeature(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  const isFeatureEnabled = async (req, res, next) => {
    try {
      const { name } = req.params;
      const enabled = await featureService.isFeatureEnabled(name);
      res.status(200).json({ data: { enabled } });
    } catch (error) {
      next(error);
    }
  };

  return {
    createFeature,
    getAllFeatures,
    getFeature,
    updateFeature,
    deleteFeature,
    isFeatureEnabled,
  };
};

export default createFeatureController;
