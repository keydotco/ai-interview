/**
 * Unit tests for the task model
 */

import { jest } from '@jest/globals';
import { taskModel } from '../../../src/models/taskModel.js';

describe('Task Model', () => {
  beforeEach(() => {
    global.tasks = [];
  });

  describe('create', () => {
    it('should create a new task with required fields', async () => {
      const taskData = { 
        title: 'Test Task', 
        userId: '123'
      };
      
      const newTask = await taskModel.create(taskData);
      
      expect(newTask).toBeDefined();
      expect(newTask.id).toBeDefined();
      expect(newTask.title).toBe('Test Task');
      expect(newTask.userId).toBe('123');
    });

    it('should require title and userId', async () => {
      const taskData = { 
        description: 'Task without required fields'
      };
      
      await expect(taskModel.create(taskData)).rejects.toThrow();
    });
  });
});
