/**
 * Task service - implements task-related business logic
 */

import { taskModel } from '../models/taskModel.js';
import { logger } from '../utils/logger.js';

export const taskService = {
  getAllTasks: async () => {
    try {
      return await taskModel.findAll();
    } catch (error) {
      logger.error('Error fetching all tasks:', error);
      throw error;
    }
  },

  getTaskById: async (id) => {
    try {
      return await taskModel.findById(id);
    } catch (error) {
      logger.error(`Error fetching task with ID ${id}:`, error);
      throw error;
    }
  },

  searchTasks: async (filters, options) => {
    try {
      logger.info(`Searching tasks with filters: ${JSON.stringify(filters)}`);
      
      const allTasks = await taskModel.findAll();
      
      let filteredTasks = allTasks.filter(task => {
        if (filters.status && task.status !== filters.status) {
          return false;
        }
        
        if (filters.priority && task.priority !== filters.priority) {
          return false;
        }
        
        if (filters.userId && task.userId !== filters.userId) {
          return false;
        }
        
        if (filters.fromDate && new Date(task.createdAt) < filters.fromDate) {
          return false;
        }
        
        if (filters.toDate && new Date(task.createdAt) > filters.toDate) {
          return false;
        }
        
        if (filters.query) {
          const query = filters.query.toLowerCase();
          const titleMatch = task.title && task.title.toLowerCase().includes(query);
          const descMatch = task.description && task.description.toLowerCase().includes(query);
          
          if (!titleMatch && !descMatch) {
            return false;
          }
        }
        
        return true;
      });
      
      const totalCount = filteredTasks.length;
      
      if (options.sort) {
        filteredTasks.sort((a, b) => {
          if (!a[options.sort]) return options.order === 'asc' ? -1 : 1;
          if (!b[options.sort]) return options.order === 'asc' ? 1 : -1;
          
          if (options.sort.includes('Date')) {
            const dateA = new Date(a[options.sort]);
            const dateB = new Date(b[options.sort]);
            return options.order === 'asc' 
              ? dateA - dateB 
              : dateB - dateA;
          }
          
          if (typeof a[options.sort] === 'string') {
            return options.order === 'asc'
              ? a[options.sort].localeCompare(b[options.sort])
              : b[options.sort].localeCompare(a[options.sort]);
          }
          
          return options.order === 'asc'
            ? a[options.sort] - b[options.sort]
            : b[options.sort] - a[options.sort];
        });
      }
      
      const totalPages = Math.ceil(totalCount / options.limit);
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
      
      return {
        tasks: paginatedTasks,
        metadata: {
          totalCount,
          page: options.page,
          limit: options.limit,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error searching tasks:', error);
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      if (!taskData.title || !taskData.userId) {
        const error = new Error('Title and userId are required');
        error.statusCode = 400;
        throw error;
      }
      
      return await taskModel.create(taskData);
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const existingTask = await taskModel.findById(id);
      if (!existingTask) {
        return null;
      }
      
      return await taskModel.update(id, taskData);
    } catch (error) {
      logger.error(`Error updating task with ID ${id}:`, error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const existingTask = await taskModel.findById(id);
      if (!existingTask) {
        return null;
      }
      
      return await taskModel.delete(id);
    } catch (error) {
      logger.error(`Error deleting task with ID ${id}:`, error);
      throw error;
    }
  }
};
