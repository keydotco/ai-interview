/**
 * Health check routes
 */

import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/detailed', (req, res) => {
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node: {
      version: process.version,
      platform: process.platform
    }
  };
  
  res.status(200).json(healthInfo);
});

export const healthRoutes = router;
