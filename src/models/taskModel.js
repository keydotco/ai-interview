/**
 * Task model - handles task data storage and retrieval
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

let tasks = [];

export const taskModel = {
  findAll: async () => {
    return [...tasks];
  },

  findById: async (id) => {
    return tasks.find(task => task.id === id) || null;
  },

  findByUserId: async (userId) => {
    return tasks.filter(task => task.userId === userId);
  },

  create: async (taskData) => {
    if (!taskData.title || !taskData.userId) {
      throw new Error('Title and userId are required fields');
    }
    
    const newTask = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description || '',
      userId: taskData.userId,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: taskData.dueDate || null
    };
    
    tasks.push(newTask);
    return newTask;
  },

  update: async (id, taskData) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return null;
    
    const updatedTask = {
      ...tasks[index],
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    
    tasks[index] = updatedTask;
    return updatedTask;
  },

  delete: async (id) => {
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    return tasks.length !== initialLength;
  }
};
