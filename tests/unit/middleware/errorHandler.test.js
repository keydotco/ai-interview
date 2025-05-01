/**
 * Unit tests for the error handler middleware
 */

import { errorHandler } from '../../../src/middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    process.env.NODE_ENV = 'test';
  });

  it('should handle errors with status code', () => {
    const error = new Error('Test error');
    error.statusCode = 400;
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Test error',
        code: 'INTERNAL_ERROR'
      }
    });
  });

  it('should default to 500 status code', () => {
    const error = new Error('Server error');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Server error',
        code: 'INTERNAL_ERROR'
      }
    });
  });

  it('should call next if error occurs in middleware', () => {
    const error = new Error('Middleware error');
    
    res.status = jest.fn().mockImplementation(() => {
      throw new Error('Another error');
    });
    
    errorHandler(error, req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});
