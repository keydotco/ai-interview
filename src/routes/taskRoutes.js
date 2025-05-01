/**
 * Task-related routes
 */

import express from 'express';
import { taskController } from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', taskController.getAllTasks);
router.get('/search', taskController.searchTasks); // Must be before /:id route
router.get('/:id', taskController.getTaskById);

router.post('/', authenticate, taskController.createTask);
router.put('/:id', authenticate, taskController.updateTask);
router.delete('/:id', authenticate, taskController.deleteTask);

export const taskRoutes = router;
