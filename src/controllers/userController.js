/**
 * User controller - handles user-related requests
 */

import { userService } from '../services/userService.js';
import { logger } from '../utils/logger.js';

export const userController = {
  getAllUsers: async (req, res, next) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const userData = req.body;
      const newUser = await userService.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      const updatedUser = await userService.updateUser(id, userData);
      
      if (!updatedUser) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      
      if (!result) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
};
