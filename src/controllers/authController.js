/**
 * Authentication controller - handles authentication-related requests
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userModel } from '../models/userModel.js';
import { logger } from '../utils/logger.js';
import { loadConfig } from '../utils/config.js';

const config = loadConfig();

export const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        const error = new Error('Name, email, and password are required');
        error.statusCode = 400;
        throw error;
      }
      
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        const error = new Error('User with this email already exists');
        error.statusCode = 409;
        throw error;
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role: 'user'
      });
      
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: config.jwtExpiresIn || '1h' }
      );
      
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        ...userWithoutPassword,
        token
      });
    } catch (error) {
      logger.error('Error in register:', error);
      next(error);
    }
  },
  
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        const error = new Error('Email and password are required');
        error.statusCode = 400;
        throw error;
      }
      
      const user = await userModel.findByEmail(email);
      if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: config.jwtExpiresIn || '1h' }
      );
      
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        ...userWithoutPassword,
        token
      });
    } catch (error) {
      logger.error('Error in login:', error);
      next(error);
    }
  }
};
