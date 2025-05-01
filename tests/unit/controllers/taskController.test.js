/**
 * Unit tests for the task controller
 */

import { jest } from '@jest/globals';
import { taskController } from '../../../src/controllers/taskController.js';
import { taskService } from '../../../src/services/taskService.js';

jest.mock('../../../src/services/taskService.js');

taskService.getAllTasks = jest.fn();
taskService.getTaskById = jest.fn();
taskService.searchTasks = jest.fn();
taskService.createTask = jest.fn();
taskService.updateTask = jest.fn();
taskService.deleteTask = jest.fn();

describe('Task Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
    next = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = { title: 'Test Task', userId: '123' };
      const mockTask = { 
        id: '1', 
        title: 'Test Task', 
        userId: '123',
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      
      req.body = taskData;
      
      taskService.createTask.mockResolvedValue(mockTask);
      
      await taskController.createTask(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTask);
      expect(taskService.createTask).toHaveBeenCalledWith(taskData);
    });
  });
});
