import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { systemLogs as logger } from '../utils/logger.js';
import { InternalServerError, ValidationError } from '../errors/index.js';

const FeatureSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Feature name is required'],
      unique: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, 'Feature description is required'],
      trim: true,
    },
    env: {
      type: String,
      enum: ['development', 'production', 'test'],
      default: 'development',
    },
    version: {
      type: String,
      default: 'v1',
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    users: [
      {
        type: String,
        ref: 'User',
      },
    ],
    expiresAt: {
      type: Date,
      default: null,
    },
    dependencies: [
      {
        type: String,
      },
    ],
    activatesAt: {
      type: Date,
      default: null,
    },
    deactivatesAt: {
      type: Date,
      default: null,
    },
    group: {
      type: String,
      default: null,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => new Map(),
    },
    rateLimit: {
      type: Number,
      min: [1, 'Rate limit must be at least 1'],
      default: null,
    },
    fallbackFlag: {
      type: String,
      default: null,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// * TTL index for automatic expiration
FeatureSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

FeatureSchema.pre('save', async function (next) {
  try {
    if (this.dependencies?.length) {
      const existingDeps = await FeatureModel.find({
        name: { $in: this.dependencies },
      });
      if (existingDeps.length !== this.dependencies.length) {
        return next(
          new ValidationError('One or more dependencies do not exist'),
        );
      }
    }
    logger.info('Feature saved', { name: this.name });
    next();
  } catch (error) {
    logger.error('Failed to save feature', { name: this.name, error });
    next(new InternalServerError('Feature save failed', { name: this.name }));
  }
});

const FeatureModel = mongoose.model('Feature', FeatureSchema);
export default () => FeatureModel;
