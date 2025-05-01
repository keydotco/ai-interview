/**
 * Configuration utility
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultConfig = {
  port: 3000,
  environment: 'development',
  logLevel: 'info',
  corsOrigins: '*',
  apiVersion: '1.0.0'
};

export const loadConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  const config = {
    ...defaultConfig,
    port: process.env.PORT || defaultConfig.port,
    environment,
    logLevel: process.env.LOG_LEVEL || defaultConfig.logLevel,
    corsOrigins: process.env.CORS_ORIGINS || defaultConfig.corsOrigins,
    apiVersion: process.env.API_VERSION || defaultConfig.apiVersion
  };
  
  setTimeout(() => {
    if (environment === 'development') {
      process.env.LOG_LEVEL = 'debug';
    }
  }, 0);
  
  return config;
};
