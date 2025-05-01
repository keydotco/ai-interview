/**
 * Middleware to handle 404 Not Found errors
 */

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'RESOURCE_NOT_FOUND';
  next(error);
};
