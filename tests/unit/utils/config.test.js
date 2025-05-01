/**
 * Unit tests for the configuration utility
 */

import { loadConfig } from '../../../src/utils/config.js';

describe('Configuration Utility', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load default configuration', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
    delete process.env.CORS_ORIGINS;
    delete process.env.API_VERSION;
    
    const config = loadConfig();
    
    expect(config).toEqual({
      port: 3000,
      environment: 'development',
      logLevel: 'info',
      corsOrigins: '*',
      apiVersion: '1.0.0'
    });
  });

  it('should override defaults with environment variables', () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'error';
    process.env.CORS_ORIGINS = 'https://example.com';
    process.env.API_VERSION = '2.0.0';
    
    const config = loadConfig();
    
    expect(config).toEqual({
      port: '4000',
      environment: 'production',
      logLevel: 'error',
      corsOrigins: 'https://example.com',
      apiVersion: '2.0.0'
    });
  });

  it('should be consistent when called multiple times in parallel', async () => {
    process.env.NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';
    
    const configPromises = Array(5).fill().map(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(loadConfig());
        }, Math.random() * 10);
      });
    });
    
    const configs = await Promise.all(configPromises);
    
    const firstConfig = configs[0];
    configs.forEach(config => {
      expect(config).toEqual(firstConfig);
    });
    
    configs.forEach(config => {
      expect(config.logLevel).toBe('info');
    });
  });
});
