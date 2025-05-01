/**
 * Performance testing routes
 * These routes demonstrate various performance issues and optimization opportunities
 */

import express from 'express';
import { performanceController } from '../controllers/performanceController.js';

const router = express.Router();

router.post('/process-users', performanceController.processUsers);

router.get('/user-statistics/:userId', performanceController.getUserStatistics);

router.post('/read-files', performanceController.readFiles);

router.get('/users-with-tasks', performanceController.getUsersWithTasks);

export const performanceRoutes = router;
