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
