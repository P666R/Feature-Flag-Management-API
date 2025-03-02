import { systemLogs as logger } from '../utils/logger.js';
import createFeatureRepository from '../repositories/feature.repository.js';
import redis from '../config/db.redis.js';
import { NotFoundError, ForbiddenError } from '../errors/index.js';

const createFeatureService = ({
  redisClient = redis,
  featureRepository = createFeatureRepository(),
} = {}) => {
  const CACHE_PREFIX = 'feature:';

  // Helper: Generate cache key for enabled state
  const getCacheKey = (name) => `${CACHE_PREFIX}${name}:enabled`;

  // Helper: Clear cache for a feature
  const clearFeatureCache = async (name) => {
    if (redisClient.isOpen) {
      const cacheKey = getCacheKey(name);
      await redisClient.del(cacheKey);
      logger.debug('Cleared Redis cache for feature', { name, cacheKey });
    }
  };

  // Main function: Check if feature is enabled
  const isFeatureEnabled = async (name) => {
    const cacheKey = getCacheKey(name);

    // Step 1: Check cache
    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached !== null) {
        return JSON.parse(cached);
      }
    }

    // Step 2: Fetch feature from repository
    const feature = await featureRepository.findFeatureByName(name);
    if (!feature) {
      throw new NotFoundError('Feature not found', { name });
    }

    // Step 3: Get enabled state and cache it
    const enabled = feature.enabled;
    logger.info('Feature check', { feature: name, enabled });

    if (redisClient.isOpen) {
      await redisClient.set(cacheKey, JSON.stringify(enabled), { EX: 300 });
    }

    return enabled;
  };

  // CRUD operations
  const createFeature = async (data) => {
    const existingFeature = await featureRepository.findFeatureByName(
      data.name,
    );
    if (existingFeature) {
      throw new ForbiddenError('Feature name already exists');
    }
    const feature = await featureRepository.createFeature(data);
    if (redisClient.isOpen) {
      await redisClient.set(
        getCacheKey(feature.name),
        JSON.stringify(feature.enabled),
        { EX: 300 },
      );
    }
    logger.info('Feature created', { name: feature.name });
    return formatFeature(feature);
  };

  const getAllFeatures = async () => {
    const features = await featureRepository.findAllFeatures();
    return {
      count: features.length,
      features: features.map(formatFeature),
    };
  };

  const getFeatureById = async (id) => {
    const feature = await featureRepository.findFeatureById(id);
    if (!feature) {
      throw new NotFoundError('Feature not found', { id });
    }
    return formatFeature(feature);
  };

  const updateFeature = async (id, data) => {
    const feature = await featureRepository.findFeatureById(id);
    if (!feature) {
      throw new NotFoundError('Feature not found', { id });
    }
    const updatedFeature = await featureRepository.updateFeature(id, data);
    await clearFeatureCache(updatedFeature.name);
    logger.info('Feature updated', { id });
    return formatFeature(updatedFeature);
  };

  const deleteFeature = async (id) => {
    const feature = await featureRepository.findFeatureById(id);
    if (!feature) {
      throw new NotFoundError('Feature not found', { id });
    }
    await featureRepository.deleteFeature(id);
    await clearFeatureCache(feature.name);
    logger.info('Feature deleted', { id });
  };

  // Helper to format feature data consistently
  const formatFeature = (feature) => ({
    id: feature.id,
    name: feature.name,
    enabled: feature.enabled,
    description: feature.description,
  });

  return {
    createFeature,
    getAllFeatures,
    getFeatureById,
    updateFeature,
    deleteFeature,
    isFeatureEnabled,
  };
};

export default createFeatureService;
