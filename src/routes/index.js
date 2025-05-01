/**
 * Configure and register all application routes
 */

import { userRoutes } from './userRoutes.js';
import { taskRoutes } from './taskRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { authRoutes } from './authRoutes.js';

export const configureRoutes = (app) => {
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/auth', authRoutes);
  
  app.use('/health', healthRoutes);
  
  app.get('/', (req, res) => {
    res.json({
      message: 'AI Interview API',
      version: '1.0.0',
      documentation: '/api-docs'
    });
  });
};
