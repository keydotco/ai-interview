/**
 * Authentication middleware
 */

import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header and verifies it
 * If valid, attaches user information to request object
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authorization header missing or invalid');
      error.statusCode = 401;
      throw error;
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      const error = new Error('Token missing');
      error.statusCode = 401;
      throw error;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid token';
      error.statusCode = 401;
    } else if (error.name === 'TokenExpiredError') {
      error.message = 'Token expired';
      error.statusCode = 401;
    }
    
    logger.error('Authentication error:', error);
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 * Must be used after authenticate middleware
 */
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
      }
      
      if (roles.length && !roles.includes(req.user.role)) {
        const error = new Error('Insufficient permissions');
        error.statusCode = 403;
        throw error;
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      next(error);
    }
  };
};
