const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/apiError');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    next(new ApiError(options.statusCode, options.message));
  },
});

module.exports = rateLimiter;
