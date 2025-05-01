/**
 * User model - handles user data storage and retrieval
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

let users = [];

export const userModel = {
  findAll: async () => {
    return [...users];
  },

  findById: async (id) => {
    return users.find(user => user.id === id) || null;
  },

  findByEmail: async (email) => {
    return users.find(user => user.email === email) || null;
  },

  create: async (userData) => {
    const newUser = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    return newUser;
  },

  update: async (id, userData) => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const updatedUser = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    users[index] = updatedUser;
    return updatedUser;
  },

  delete: async (id) => {
    const initialLength = users.length;
    users = users.filter(user => user.id !== id);
    return users.length !== initialLength;
  }
};
