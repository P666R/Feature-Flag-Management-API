const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader?.startsWith('Bearer ')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return next(new ApiError(401, 'Not authorized to access this route'));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      req.user = await User.findOne({ _id: decoded.id });

      if (!req.user) {
        return next(new ApiError(401, 'User not found'));
      }

      next();
    } catch (err) {
      return next(new ApiError(401, 'Not authorized to access this route'));
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role ${req.user.role} is unauthorized to access this route`
        )
      );
    }
    next();
  };
};
