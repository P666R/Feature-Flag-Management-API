const { validationResult, check } = require('express-validator');
const ApiError = require('../utils/apiError');

// Validation middleware
exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors
      .array()
      .map((err) => ({ [err.param]: err.msg }));

    return next(
      new ApiError(
        400,
        'Validation Error',
        true,
        JSON.stringify(extractedErrors)
      )
    );
  };
};

// Validation rules for feature flags
exports.flagValidationRules = {
  create: [
    check('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage('Name cannot be more than 50 characters'),
    check('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters'),
    check('isEnabled')
      .optional()
      .isBoolean()
      .withMessage('isEnabled must be a boolean value'),
  ],
  update: [
    check('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty if provided')
      .isLength({ max: 50 })
      .withMessage('Name cannot be more than 50 characters'),
    check('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters'),
    check('isEnabled')
      .optional()
      .isBoolean()
      .withMessage('isEnabled must be a boolean value'),
  ],
};

// Validation rules for auth
exports.authValidationRules = {
  register: [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please include a valid email'),
    check('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  login: [
    check('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please include a valid email'),
    check('password').trim().notEmpty().withMessage('Password is required'),
  ],
};

// Validation rules for users
exports.userValidationRules = {
  create: [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please include a valid email'),
    check('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    check('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
  ],
  update: [
    check('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty if provided'),
    check('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please include a valid email'),
    check('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
  ],
};
