/**
 * Task controller - handles task-related requests
 */

import { taskService } from '../services/taskService.js';
import { logger } from '../utils/logger.js';

export const taskController = {
  getAllTasks: async (req, res, next) => {
    try {
      const tasks = await taskService.getAllTasks();
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },

  getTaskById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  searchTasks: async (req, res, next) => {
    try {
      const {
        status,
        priority,
        userId,
        fromDate,
        toDate,
        query,
        sort = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 10
      } = req.query;
      
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      if (isNaN(pageNum) || pageNum < 1) {
        const error = new Error('Page must be a positive integer');
        error.statusCode = 400;
        throw error;
      }
      
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        const error = new Error('Limit must be a positive integer between 1 and 50');
        error.statusCode = 400;
        throw error;
      }
      
      if (fromDate && isNaN(Date.parse(fromDate))) {
        const error = new Error('Invalid fromDate format');
        error.statusCode = 400;
        throw error;
      }
      
      if (toDate && isNaN(Date.parse(toDate))) {
        const error = new Error('Invalid toDate format');
        error.statusCode = 400;
        throw error;
      }
      
      const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority'];
      if (sort && !validSortFields.includes(sort)) {
        const error = new Error(`Sort must be one of: ${validSortFields.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      
      const validOrders = ['asc', 'desc'];
      if (order && !validOrders.includes(order)) {
        const error = new Error(`Order must be one of: ${validOrders.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      
      const filters = {
        status,
        priority,
        userId,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        query
      };
      
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });
      
      const result = await taskService.searchTasks(filters, {
        sort,
        order,
        page: pageNum,
        limit: limitNum
      });
      
      res.json(result);
    } catch (error) {
      logger.error('Error searching tasks:', error);
      next(error);
    }
  },

  createTask: async (req, res, next) => {
    try {
      const taskData = req.body;
      
      if (req.user) {
        taskData.userId = req.user.id;
      }
      
      const newTask = await taskService.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  },

  updateTask: async (req, res, next) => {
    try {
      const { id } = req.params;
      const taskData = req.body;
      const updatedTask = await taskService.updateTask(id, taskData);
      
      if (!updatedTask) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  },

  deleteTask: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await taskService.deleteTask(id);
      
      if (!result) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
};
