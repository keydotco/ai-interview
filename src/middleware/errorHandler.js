/**
 * Global error handling middleware
 */

import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', err);

  const statusCode = err.statusCode || 500;
  
  const errorResponse = {
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
    }
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  try {
    res.status(statusCode).json(errorResponse);
  } catch (error) {
    next(error);
  }
};
