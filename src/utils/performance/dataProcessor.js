/**
 * Data processing utility for handling large datasets
 * 
 * This utility contains several functions for processing data
 * that could be optimized for better performance.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Processes user data sequentially
 * This function processes each user one at a time, which is inefficient for large datasets
 */
export const processUserData = async (userIds) => {
  logger.info(`Processing ${userIds.length} users sequentially`);
  const startTime = Date.now();
  
  const results = [];
  
  for (const userId of userIds) {
    try {
      const userData = await fetchUserData(userId);
      
      const processedData = await processUser(userData);
      
      results.push(processedData);
    } catch (error) {
      logger.error(`Error processing user ${userId}:`, error);
    }
  }
  
  const endTime = Date.now();
  logger.info(`Sequential processing completed in ${endTime - startTime}ms`);
  
  return {
    results,
    processingTime: endTime - startTime
  };
};

/**
 * Simulates fetching user data from a database or API
 */
export const fetchUserData = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    createdAt: new Date().toISOString()
  };
};

/**
 * Simulates processing a user's data
 */
export const processUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    ...userData,
    processed: true,
    score: Math.floor(Math.random() * 100),
    processedAt: new Date().toISOString()
  };
};

/**
 * Expensive calculation that could benefit from caching/memoization
 * This function recalculates the same values repeatedly
 */
export const calculateUserStatistics = async (userId, dataPoints) => {
  logger.info(`Calculating statistics for user ${userId} with ${dataPoints} data points`);
  const startTime = Date.now();
  
  const historicalData = await fetchUserHistoricalData(userId, dataPoints);
  
  const stats = {
    average: calculateAverage(historicalData),
    median: calculateMedian(historicalData),
    standardDeviation: calculateStandardDeviation(historicalData),
    percentiles: calculatePercentiles(historicalData)
  };
  
  const endTime = Date.now();
  logger.info(`Statistics calculation completed in ${endTime - startTime}ms`);
  
  return {
    userId,
    stats,
    calculationTime: endTime - startTime
  };
};

/**
 * Simulates fetching historical data for a user
 */
export const fetchUserHistoricalData = async (userId, dataPoints) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return Array.from({ length: dataPoints }, () => ({
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    value: Math.floor(Math.random() * 1000)
  }));
};

/**
 * Calculates the average of data points
 */
export const calculateAverage = (data) => {
  const sum = data.reduce((acc, item) => acc + item.value, 0);
  return sum / data.length;
};

/**
 * Calculates the median of data points
 */
export const calculateMedian = (data) => {
  const values = [...data].sort((a, b) => a.value - b.value);
  const mid = Math.floor(values.length / 2);
  
  return values.length % 2 === 0
    ? (values[mid - 1].value + values[mid].value) / 2
    : values[mid].value;
};

/**
 * Calculates the standard deviation of data points
 */
export const calculateStandardDeviation = (data) => {
  const avg = calculateAverage(data);
  const squareDiffs = data.map(item => {
    const diff = item.value - avg;
    return diff * diff;
  });
  
  const avgSquareDiff = calculateAverage({ 
    map: () => {}, 
    reduce: (acc, val) => acc + val, 
    length: squareDiffs.length 
  });
  
  return Math.sqrt(avgSquareDiff);
};

/**
 * Calculates percentiles (25th, 50th, 75th, 90th, 95th, 99th)
 */
export const calculatePercentiles = (data) => {
  const values = [...data].sort((a, b) => a.value - b.value);
  
  return {
    p25: calculatePercentile(values, 25),
    p50: calculatePercentile(values, 50),
    p75: calculatePercentile(values, 75),
    p90: calculatePercentile(values, 90),
    p95: calculatePercentile(values, 95),
    p99: calculatePercentile(values, 99)
  };
};

/**
 * Calculates a specific percentile
 */
export const calculatePercentile = (sortedData, percentile) => {
  const index = Math.ceil((percentile / 100) * sortedData.length) - 1;
  return sortedData[index].value;
};

/**
 * Inefficient file reading function that reads files sequentially
 */
export const readFilesSequentially = async (filePaths) => {
  logger.info(`Reading ${filePaths.length} files sequentially`);
  const startTime = Date.now();
  
  const results = [];
  
  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      results.push({
        path: filePath,
        content,
        size: content.length
      });
    } catch (error) {
      logger.error(`Error reading file ${filePath}:`, error);
      results.push({
        path: filePath,
        error: error.message
      });
    }
  }
  
  const endTime = Date.now();
  logger.info(`Sequential file reading completed in ${endTime - startTime}ms`);
  
  return {
    results,
    processingTime: endTime - startTime
  };
};
