import createErrorHandler from './error.factory.js';

const errorMiddleware = (dependencies) => {
  const { handleHttpError } = createErrorHandler(dependencies);
  return handleHttpError;
};

export default errorMiddleware;
