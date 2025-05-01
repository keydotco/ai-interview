/**
 * Performance controller - demonstrates various performance issues and optimization opportunities
 */

import { 
  processUserData, 
  calculateUserStatistics, 
  readFilesSequentially 
} from '../utils/performance/dataProcessor.js';
import { userModel } from '../models/userModel.js';
import { taskModel } from '../models/taskModel.js';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statisticsCache = new Map();

export const performanceController = {
  /**
   * Process a list of user IDs sequentially
   * This demonstrates inefficient sequential processing that could be optimized with Promise.all
   */
  processUsers: async (req, res, next) => {
    try {
      const { userIds } = req.body;
      
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ 
          error: 'userIds must be an array' 
        });
      }
      
      const result = await processUserData(userIds);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get statistics for a user
   * This demonstrates an expensive calculation that could benefit from caching
   */
  getUserStatistics: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { dataPoints = 100 } = req.query;
      
      const numDataPoints = parseInt(dataPoints, 10);
      
      if (isNaN(numDataPoints) || numDataPoints < 1 || numDataPoints > 1000) {
        return res.status(400).json({ 
          error: 'dataPoints must be a number between 1 and 1000' 
        });
      }
      
      const result = await calculateUserStatistics(userId, numDataPoints);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Read multiple files sequentially
   * This demonstrates inefficient sequential file operations
   */
  readFiles: async (req, res, next) => {
    try {
      const { filePaths } = req.body;
      
      if (!filePaths || !Array.isArray(filePaths)) {
        return res.status(400).json({ 
          error: 'filePaths must be an array' 
        });
      }
      
      const result = await readFilesSequentially(filePaths);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get users with their tasks
   * This demonstrates the N+1 query problem - inefficient for fetching related data
   */
  getUsersWithTasks: async (req, res, next) => {
    try {
      const startTime = Date.now();
      
      const users = await userModel.findAll();
      
      const usersWithTasks = [];
      
      for (const user of users) {
        const tasks = await taskModel.findByUserId(user.id);
        
        usersWithTasks.push({
          ...user,
          tasks
        });
      }
      
      const endTime = Date.now();
      
      res.json({
        users: usersWithTasks,
        processingTime: endTime - startTime
      });
    } catch (error) {
      next(error);
    }
  }
};
