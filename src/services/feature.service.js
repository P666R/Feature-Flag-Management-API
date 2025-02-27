import { systemLogs as logger } from '../utils/logger.js';
import createFeatureRepository from '../repositories/feature.repository.js';
import createRedisClient from '../config/db.redis.js';
import { envConfig } from '../config/env.config.js';
import { NotFoundError, ForbiddenError } from '../errors/index.js';
import crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const createFeatureService = ({
  featureRepository = createFeatureRepository(),
  redisClient = createRedisClient(),
} = {}) => {
  const CACHE_PREFIX = 'feature:';
  let isRedisConnected = false;
  const rateLimiters = new Map(); // * In-memory rate limiters per feature

  redisClient.on('connect', () => {
    isRedisConnected = true;
    logger.info('Redis connected for feature caching');
  });
  redisClient.on('error', (err) => {
    isRedisConnected = false;
    logger.error('Redis connection error', { error: err });
  });

  const getCacheKey = (name, version, userId) =>
    `${CACHE_PREFIX}${name}:${version}:${userId || 'global'}`;

  // * Helper: Check if feature is active based on time constraints
  const isActiveWithinTime = (feature) => {
    const now = new Date();
    if (feature.activatesAt && now < feature.activatesAt) {
      return false;
    } else if (feature.deactivatesAt && now > feature.deactivatesAt) {
      return false;
    } else if (feature.expiresAt && now > feature.expiresAt) {
      return false;
    } else {
      return true;
    }
  };

  // * Helper: Check if all dependencies are enabled
  const areDependenciesEnabled = async (dependencies, version, userId) => {
    for (const dep of dependencies) {
      const depEnabled = await isFeatureEnabled(dep, version, userId);
      if (!depEnabled) {
        return false;
      }
    }
    return true;
  };

  // * Helper: Check if user is rate-limited for this feature
  const isRateLimited = async (feature, userId) => {
    if (!feature.rateLimit || !userId) {
      return false;
    }
    let limiter = rateLimiters.get(feature.name);
    if (!limiter) {
      limiter = new RateLimiterMemory({
        points: feature.rateLimit, // * Max requests
        duration: 60, // * Per minute
      });
      rateLimiters.set(feature.name, limiter);
    }
    try {
      await limiter.consume(userId);
      return false; // * Not rate-limited
    } catch (rejRes) {
      logger.warn('Rate limit exceeded', {
        feature: feature.name,
        userId,
        rejRes,
      });
      return true; // * Rate-limited
    }
  };

  // * Helper: Evaluate user-specific enabling (users list or percentage)
  const isUserEnabled = (feature, userId) => {
    if (!userId) {
      return feature.enabled;
    }
    if (feature.users?.includes(userId)) {
      return true;
    }
    if (feature.percentage < 100) {
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      const value = parseInt(hash.slice(0, 8), 16) % 100;
      return value < feature.percentage;
    }
    return feature.enabled;
  };

  // * Main function: Check if feature is enabled
  const isFeatureEnabled = async (name, version = 'v1', userId = null) => {
    const cacheKey = getCacheKey(name, version, userId);

    // * Step 1: Check cache
    if (isRedisConnected) {
      const cached = await redisClient.get(cacheKey);
      if (cached !== null) {
        return JSON.parse(cached);
      }
    }

    // * Step 2: Fetch feature from repository
    const feature = await featureRepository.findFeatureByName(name, version);
    if (!feature || feature.env !== envConfig.NODE_ENV) {
      return handleDisabledFeature(feature, cacheKey, version, userId);
    }

    // * Step 3: Check time constraints
    if (!isActiveWithinTime(feature)) {
      return handleDisabledFeature(feature, cacheKey, version, userId);
    }

    // * Step 4: Check dependencies
    if (feature.dependencies?.length) {
      const depsEnabled = await areDependenciesEnabled(
        feature.dependencies,
        version,
        userId,
      );
      if (!depsEnabled) {
        return handleDisabledFeature(feature, cacheKey, version, userId);
      }
    }

    // * Step 5: Determine if feature is enabled for this user
    let enabled = isUserEnabled(feature, userId);

    // * Step 6: Apply rate limiting if enabled
    if (enabled && (await isRateLimited(feature, userId))) {
      enabled = false;
    }

    // * Step 7: Check fallback if not enabled
    if (!enabled && feature.fallbackFlag) {
      enabled = await isFeatureEnabled(feature.fallbackFlag, version, userId);
    }

    // * Step 8: Log and cache result
    logger.info('Feature check', {
      feature: name,
      enabled,
      userId,
      version,
      group: feature.group,
    });
    if (isRedisConnected) {
      await redisClient.set(cacheKey, JSON.stringify(enabled), { EX: 300 });
    }

    return enabled;
  };

  // * Helper: Handle disabled feature with fallback logic
  const handleDisabledFeature = async (feature, cacheKey, version, userId) => {
    let enabled = false;
    if (feature?.fallbackFlag) {
      enabled = await isFeatureEnabled(feature.fallbackFlag, version, userId);
    }
    if (isRedisConnected) {
      await redisClient.set(cacheKey, JSON.stringify(enabled), { EX: 300 });
    }
    return enabled;
  };

  // * CRUD operations
  const createFeature = async (data) => {
    const existingFeature = await featureRepository.findFeatureByName(
      data.name,
    );
    if (existingFeature) {
      throw new ForbiddenError('Feature name already exists');
    }
    const feature = await featureRepository.createFeature(data);
    if (isRedisConnected) {
      await redisClient.set(
        getCacheKey(feature.name, feature.version, null),
        JSON.stringify(feature.enabled),
      );
    }
    logger.info('Feature created', { name: feature.name });
    return {
      id: feature.id,
      name: feature.name,
      enabled: feature.enabled,
      description: feature.description,
      env: feature.env,
      version: feature.version,
      percentage: feature.percentage,
      users: feature.users,
      expiresAt: feature.expiresAt,
      dependencies: feature.dependencies,
      activatesAt: feature.activatesAt,
      deactivatesAt: feature.deactivatesAt,
      group: feature.group,
      metadata: Object.fromEntries(feature.metadata),
      rateLimit: feature.rateLimit,
      fallbackFlag: feature.fallbackFlag,
      priority: feature.priority,
    };
  };

  const getAllFeatures = async () => {
    const features = await featureRepository.findAllFeatures();
    return {
      count: features.length,
      features: features.map((f) => ({
        id: f.id,
        name: f.name,
        enabled: f.enabled,
        description: f.description,
        env: f.env,
        version: f.version,
        percentage: f.percentage,
        users: f.users,
        expiresAt: f.expiresAt,
        dependencies: f.dependencies,
        activatesAt: f.activatesAt,
        deactivatesAt: f.deactivatesAt,
        group: f.group,
        metadata: Object.fromEntries(f.metadata),
        rateLimit: f.rateLimit,
        fallbackFlag: f.fallbackFlag,
        priority: f.priority,
      })),
    };
  };

  const getFeatureById = async (id) => {
    const feature = await featureRepository.findFeatureById(id);
    if (!feature) {
      throw new NotFoundError('Feature not found', { id });
    }
    return {
      id: feature.id,
      name: feature.name,
      enabled: feature.enabled,
      description: feature.description,
      env: feature.env,
      version: feature.version,
      percentage: feature.percentage,
      users: feature.users,
      expiresAt: feature.expiresAt,
      dependencies: feature.dependencies,
      activatesAt: feature.activatesAt,
      deactivatesAt: feature.deactivatesAt,
      group: feature.group,
      metadata: Object.fromEntries(feature.metadata),
      rateLimit: feature.rateLimit,
      fallbackFlag: feature.fallbackFlag,
      priority: feature.priority,
    };
  };

  const updateFeature = async (id, data) => {
    const feature = await featureRepository.findFeatureById(id);
    if (!feature) {
      throw new NotFoundError('Feature not found', { id });
    }
    const updatedFeature = await featureRepository.updateFeature(id, data);
    if (isRedisConnected) {
      await redisClient.del(
        getCacheKey(updatedFeature.name, updatedFeature.version, null),
      );
    }
    logger.info('Feature updated', { id });
    return {
      id: updatedFeature.id,
      name: updatedFeature.name,
      enabled: updatedFeature.enabled,
      description: updatedFeature.description,
      env: updatedFeature.env,
      version: updatedFeature.version,
      percentage: updatedFeature.percentage,
      users: updatedFeature.users,
      expiresAt: updatedFeature.expiresAt,
      dependencies: updatedFeature.dependencies,
      activatesAt: updatedFeature.activatesAt,
      deactivatesAt: updatedFeature.deactivatesAt,
      group: updatedFeature.group,
      metadata: Object.fromEntries(updatedFeature.metadata),
      rateLimit: updatedFeature.rateLimit,
      fallbackFlag: updatedFeature.fallbackFlag,
      priority: updatedFeature.priority,
    };
  };

  const deleteFeature = async (id) => {
    const feature = await featureRepository.findFeatureById(id);
    if (!feature) {
      throw new NotFoundError('Feature not found', { id });
    }
    await featureRepository.deleteFeature(id);
    if (isRedisConnected) {
      await redisClient.del(getCacheKey(feature.name, feature.version, null));
    }
    logger.info('Feature deleted', { id });
  };

  const toggleGroup = async (groupName, enabled) => {
    const features = await featureRepository.findFeaturesByGroup(groupName);
    for (const feature of features) {
      await updateFeature(feature.id, { enabled });
    }
    logger.info('Feature group toggled', { group: groupName, enabled });
    return features.length;
  };

  return {
    createFeature,
    getAllFeatures,
    getFeatureById,
    updateFeature,
    deleteFeature,
    toggleGroup,
    isFeatureEnabled,
  };
};

export default createFeatureService;
