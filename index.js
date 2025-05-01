/**
 * Application entry point
 */

import app from './src/app.js';
import { logger } from './src/utils/logger.js';
import { loadConfig } from './src/utils/config.js';

const config = loadConfig();
const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.environment} mode`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

export default server;
