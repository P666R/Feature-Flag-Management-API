// * Base custom error class
class CustomError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// * Specific error types
class ValidationError extends CustomError {
  constructor(message, details = {}) {
    super(message, 400, details);
  }
}

class NotFoundError extends CustomError {
  constructor(message, details = {}) {
    super(message, 404, details);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message, details = {}) {
    super(message, 401, details);
  }
}

class ForbiddenError extends CustomError {
  constructor(message, details = {}) {
    super(message, 403, details);
  }
}

class InternalServerError extends CustomError {
  constructor(message, details = {}) {
    super(message, 500, details);
  }
}

export {
  CustomError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
};
