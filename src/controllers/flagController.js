const Flag = require('../models/Flag');
const ApiError = require('../utils/apiError');

// @desc    Create new feature flag
// @route   POST /api/flags
// @access  Private
exports.createFlag = async (req, res, next) => {
  try {
    const { name, description, isEnabled } = req.body;

    // Create flag
    const flag = await Flag.create({
      name,
      description,
      isEnabled: isEnabled !== undefined ? isEnabled : false,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feature flags
// @route   GET /api/flags
// @access  Private
exports.getFlags = async (req, res, next) => {
  try {
    const flags = await Flag.find();

    res.status(200).json({
      success: true,
      count: flags.length,
      data: flags,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single feature flag
// @route   GET /api/flags/:id
// @access  Private
exports.getFlag = async (req, res, next) => {
  try {
    const flag = await Flag.findById(req.params.id);

    if (!flag) {
      return next(
        new ApiError(404, `Flag not found with id of ${req.params.id}`)
      );
    }

    res.status(200).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feature flag
// @route   PUT /api/flags/:id
// @access  Private
exports.updateFlag = async (req, res, next) => {
  try {
    let flag = await Flag.findById(req.params.id);

    if (!flag) {
      return next(
        new ApiError(404, `Flag not found with id of ${req.params.id}`)
      );
    }

    // Check if user is flag owner or admin
    if (
      flag.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(
          403,
          `User ${req.user._id} is not authorized to update this flag`
        )
      );
    }

    flag = await Flag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feature flag
// @route   DELETE /api/flags/:id
// @access  Private
exports.deleteFlag = async (req, res, next) => {
  try {
    const flag = await Flag.findById(req.params.id);

    if (!flag) {
      return next(
        new ApiError(404, `Flag not found with id of ${req.params.id}`)
      );
    }

    // Check if user is flag owner or admin
    if (
      flag.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(
          403,
          `User ${req.user._id} is not authorized to delete this flag`
        )
      );
    }

    const deletedFlag = await Flag.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: deletedFlag,
    });
  } catch (error) {
    next(error);
  }
};
