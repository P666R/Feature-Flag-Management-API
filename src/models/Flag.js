const mongoose = require('mongoose');
const validator = require('validator');

const FlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name for the feature flag'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    isEnabled: {
      type: Boolean,
      default: false,
      validate: {
        validator: function (v) {
          return validator.isBoolean(String(v));
        },
        message: 'isEnabled must be a boolean value',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Flag', FlagSchema);
