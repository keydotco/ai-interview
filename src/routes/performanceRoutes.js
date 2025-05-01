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

router.post('/process-users-optimized', performanceController.processUsersOptimized);
router.get('/user-statistics-optimized/:userId', performanceController.getUserStatisticsOptimized);
router.post('/read-files-optimized', performanceController.readFilesOptimized);
router.get('/users-with-tasks-optimized', performanceController.getUsersWithTasksOptimized);

export const performanceRoutes = router;
