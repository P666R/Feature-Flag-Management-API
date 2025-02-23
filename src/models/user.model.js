import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { validate as isEmail } from 'email-validator';
import { ROLES } from '../constants';
import { systemLogs } from '../utils/logger.js';
import { envConfig } from '../config/env.config.js';

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      validate: [isEmail, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      select: false,
      minlength: 8,
      validate: {
        validator: (value) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value,
          ),
        message:
          'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      },
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// * Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    systemLogs.info('Password hashed', { email: this.email });
  } catch (error) {
    systemLogs.error('Failed to hash password', { email: this.email, error });
    next(error);
  }
});

// * Method to generate JWT using UUID id
UserSchema.methods.getSignedJwtToken = function () {
  const token = jwt.sign({ id: this.id }, envConfig.JWT_SECRET, {
    expiresIn: envConfig.JWT_EXPIRES_IN,
  });
  systemLogs.info('JWT generated', { email: this.email });
  return token;
};

// * Method to match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    const isMatched = await bcrypt.compare(enteredPassword, this.password);
    systemLogs.info('Password match attempt', {
      email: this.email,
      result: isMatched ? 'success' : 'failed',
    });
    return isMatched;
  } catch (error) {
    systemLogs.error('Failed to match password', { email: this.email, error });
    throw error;
  }
};

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
