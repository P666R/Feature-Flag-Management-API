import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { systemLogs as logger } from '../utils/logger.js';
import { InternalServerError } from '../errors/index.js';

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
  },
  { timestamps: true },
);

FeatureSchema.pre('save', async function (next) {
  try {
    logger.info('Feature saved', { name: this.name });
    next();
  } catch (error) {
    logger.error('Failed to save feature', { name: this.name, error });
    next(new InternalServerError('Feature save failed', { name: this.name }));
  }
});

const FeatureModel = mongoose.model('Feature', FeatureSchema);
export default () => FeatureModel;
