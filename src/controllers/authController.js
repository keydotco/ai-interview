/**
 * Authentication controller - handles authentication-related requests
 */

import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
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
      
      const hashedPassword = await argon2.hash(password);
      
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
      
      try {
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
          const error = new Error('Invalid credentials');
          error.statusCode = 401;
          throw error;
        }
      } catch (verifyError) {
        logger.error('Error verifying password:', verifyError);
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
