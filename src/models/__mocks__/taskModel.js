/**
 * Mock implementation for taskModel
 */

import { jest } from '@jest/globals';

export const taskModel = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};
