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

  createTask: async (req, res, next) => {
    try {
      const taskData = req.body;
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
