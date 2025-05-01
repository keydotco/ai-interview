/**
 * Unit tests for the task service
 */

import { jest } from '@jest/globals';
import { taskService } from '../../../src/services/taskService.js';
import { taskModel } from '../../../src/models/taskModel.js';

jest.mock('../../../src/models/taskModel.js');

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchTasks', () => {
    it('should filter tasks based on status', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'pending', userId: 'user1' },
        { id: '2', title: 'Task 2', status: 'in-progress', userId: 'user1' },
        { id: '3', title: 'Task 3', status: 'completed', userId: 'user2' }
      ];
      
      taskModel.findAll.mockResolvedValue(mockTasks);
      
      const result = await taskService.searchTasks(
        { status: 'pending' },
        { page: 1, limit: 10 }
      );
      
      expect(taskModel.findAll).toHaveBeenCalled();
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe('1');
      expect(result.metadata.totalCount).toBe(1);
    });

    it('should filter tasks based on userId', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'pending', userId: 'user1' },
        { id: '2', title: 'Task 2', status: 'in-progress', userId: 'user1' },
        { id: '3', title: 'Task 3', status: 'completed', userId: 'user2' }
      ];
      
      taskModel.findAll.mockResolvedValue(mockTasks);
      
      const result = await taskService.searchTasks(
        { userId: 'user1' },
        { page: 1, limit: 10 }
      );
      
      expect(taskModel.findAll).toHaveBeenCalled();
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('1');
      expect(result.tasks[1].id).toBe('2');
      expect(result.metadata.totalCount).toBe(2);
    });

    it('should filter tasks based on text query', async () => {
      const mockTasks = [
        { id: '1', title: 'Important Task', description: 'High priority', userId: 'user1' },
        { id: '2', title: 'Regular Task', description: 'Medium priority', userId: 'user1' },
        { id: '3', title: 'Low Task', description: 'Not important', userId: 'user2' }
      ];
      
      taskModel.findAll.mockResolvedValue(mockTasks);
      
      const result = await taskService.searchTasks(
        { query: 'priority' },
        { page: 1, limit: 10 }
      );
      
      expect(taskModel.findAll).toHaveBeenCalled();
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('1');
      expect(result.tasks[1].id).toBe('2');
      expect(result.metadata.totalCount).toBe(2);
    });

    it('should sort tasks correctly', async () => {
      const mockTasks = [
        { 
          id: '1', 
          title: 'Task A', 
          priority: 'high', 
          createdAt: '2023-01-03T00:00:00.000Z' 
        },
        { 
          id: '2', 
          title: 'Task B', 
          priority: 'medium', 
          createdAt: '2023-01-01T00:00:00.000Z' 
        },
        { 
          id: '3', 
          title: 'Task C', 
          priority: 'low', 
          createdAt: '2023-01-02T00:00:00.000Z' 
        }
      ];
      
      taskModel.findAll.mockResolvedValue(mockTasks);
      
      const result = await taskService.searchTasks(
        {},
        { sort: 'createdAt', order: 'asc', page: 1, limit: 10 }
      );
      
      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0].id).toBe('2'); // Oldest first
      expect(result.tasks[1].id).toBe('3');
      expect(result.tasks[2].id).toBe('1');
    });

    it('should paginate results correctly', async () => {
      const mockTasks = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Task ${i + 1}`
      }));
      
      taskModel.findAll.mockResolvedValue(mockTasks);
      
      const result = await taskService.searchTasks(
        {},
        { page: 2, limit: 10 }
      );
      
      expect(result.tasks).toHaveLength(10);
      expect(result.tasks[0].id).toBe('11'); // Second page starts at 11
      expect(result.tasks[9].id).toBe('20');
      expect(result.metadata).toEqual({
        totalCount: 25,
        page: 2,
        limit: 10,
        totalPages: 3
      });
    });

    it('should handle multiple filters together', async () => {
      const mockTasks = [
        { 
          id: '1', 
          title: 'Important Task', 
          status: 'pending', 
          priority: 'high',
          userId: 'user1',
          createdAt: '2023-01-01T00:00:00.000Z'
        },
        { 
          id: '2', 
          title: 'Regular Task', 
          status: 'pending', 
          priority: 'medium',
          userId: 'user1',
          createdAt: '2023-01-02T00:00:00.000Z'
        },
        { 
          id: '3', 
          title: 'Low Task', 
          status: 'completed', 
          priority: 'low',
          userId: 'user2',
          createdAt: '2023-01-03T00:00:00.000Z'
        }
      ];
      
      taskModel.findAll.mockResolvedValue(mockTasks);
      
      const result = await taskService.searchTasks(
        { status: 'pending', userId: 'user1' },
        { page: 1, limit: 10 }
      );
      
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('1');
      expect(result.tasks[1].id).toBe('2');
      expect(result.metadata.totalCount).toBe(2);
    });

    it('should handle empty result set', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'pending', userId: 'user1' },
        { id: '2', title: 'Task 2', status: 'in-progress', userId: 'user1' }
      ];
      
      taskModel.findAll.mockResolvedValue(mockTasks);
      
      const result = await taskService.searchTasks(
        { status: 'completed' },
        { page: 1, limit: 10 }
      );
      
      expect(result.tasks).toHaveLength(0);
      expect(result.metadata.totalCount).toBe(0);
      expect(result.metadata.totalPages).toBe(0);
    });
  });
});
