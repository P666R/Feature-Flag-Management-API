import rateLimit from 'express-rate-limit';

export default (max, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    message: `Too many ${message} requests from this IP, please try again after 15 minutes`,
    standardHeaders: true,
    legacyHeaders: false,
  });
