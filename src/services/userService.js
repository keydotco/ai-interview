/**
 * User service - implements user-related business logic
 */

import { userModel } from '../models/userModel.js';
import { logger } from '../utils/logger.js';

const userOperations = [];

export const userService = {
  getAllUsers: async () => {
    try {
      return await userModel.findAll();
    } catch (error) {
      logger.error('Error fetching all users:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      return await userModel.findById(id);
    } catch (error) {
      logger.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      if (!userData.name || !userData.email) {
        const error = new Error('Name and email are required');
        error.statusCode = 400;
        throw error;
      }
      
      const existingUser = await userModel.findByEmail(userData.email);
      if (existingUser) {
        const error = new Error('User with this email already exists');
        error.statusCode = 409;
        throw error;
      }
      
      const operation = {
        type: 'create',
        timestamp: new Date().toISOString(),
        data: { ...userData } // Captures a reference to userData
      };
      userOperations.push(operation);
      
      return await userModel.create(userData);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return null;
      }
      
      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await userModel.findByEmail(userData.email);
        if (userWithEmail && userWithEmail.id !== id) {
          const error = new Error('Email already in use');
          error.statusCode = 409;
          throw error;
        }
      }
      
      const operation = {
        type: 'update',
        timestamp: new Date().toISOString(),
        data: { id, ...userData } // Captures a reference to userData
      };
      userOperations.push(operation);
      
      return await userModel.update(id, userData);
    } catch (error) {
      logger.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return null;
      }
      
      const operation = {
        type: 'delete',
        timestamp: new Date().toISOString(),
        data: { id, user: { ...existingUser } } // Captures a reference to existingUser
      };
      userOperations.push(operation);
      
      return await userModel.delete(id);
    } catch (error) {
      logger.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
};
