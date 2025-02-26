import createFeatureModel from '../models/feature.model.js';
import { systemLogs as logger } from '../utils/logger.js';
import { NotFoundError } from '../errors/index.js';

const createFeatureRepository = ({ Feature = createFeatureModel() } = {}) => {
  const createFeature = async (data) => {
    try {
      const feature = await Feature.create(data);
      logger.info('Feature created in database', { name: data.name });
      return feature;
    } catch (error) {
      logger.error('Failed to create feature in database', {
        name: data.name,
        error,
      });
      throw error;
    }
  };

  const findAllFeatures = async () => {
    return await Feature.find().select('-_id -__v');
  };

  const findFeatureById = async (id) => {
    return await Feature.findOne({ id }).select('-_id -__v');
  };

  const findFeatureByName = async (name) => {
    return await Feature.findOne({ name }).select('-_id -__v');
  };

  const findFeaturesByGroup = async (group) => {
    return await Feature.find({ group }).select('-_id -__v');
  };

  const updateFeature = async (id, data) => {
    try {
      const feature = await Feature.findOneAndUpdate({ id }, data, {
        new: true,
        runValidators: true,
      }).select('-_id -__v');
      if (!feature) {
        throw new NotFoundError('Feature not found', { id });
      }
      logger.info('Feature updated in database', { id });
      return feature;
    } catch (error) {
      logger.error('Failed to update feature in database', { id, error });
      throw error;
    }
  };

  const deleteFeature = async (id) => {
    try {
      const feature = await Feature.findOneAndDelete({ id });
      if (!feature) {
        throw new NotFoundError('Feature not found', { id });
      }
      logger.info('Feature deleted in database', { id });
      return feature;
    } catch (error) {
      logger.error('Failed to delete feature in database', { id, error });
      throw error;
    }
  };

  return {
    createFeature,
    findAllFeatures,
    findFeatureById,
    findFeatureByName,
    findFeaturesByGroup,
    updateFeature,
    deleteFeature,
  };
};

export default createFeatureRepository;
