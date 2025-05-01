/**
 * Mock implementation for taskService
 */

import { jest } from '@jest/globals';

export const taskService = {
  getAllTasks: jest.fn(),
  getTaskById: jest.fn(),
  searchTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn()
};
