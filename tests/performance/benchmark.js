/**
 * Performance benchmarking utility
 * 
 * This utility provides tools for benchmarking the performance of API endpoints
 * and functions in the application. It uses autocannon for HTTP benchmarking
 * and provides utilities for measuring function execution time.
 */

import autocannon from 'autocannon';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run an HTTP benchmark against a specified endpoint
 * @param {Object} options - Benchmark options
 * @returns {Promise<Object>} - Benchmark results
 */
export const runHttpBenchmark = async (options) => {
  const defaults = {
    url: 'http://localhost:3000',
    connections: 10,
    duration: 5,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const benchmarkOptions = { ...defaults, ...options };
  
  console.log(`Running benchmark against ${benchmarkOptions.url} for ${benchmarkOptions.duration}s`);
  
  const run = promisify(autocannon);
  const results = await run(benchmarkOptions);
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const resultsPath = path.join(__dirname, 'results', `benchmark-${timestamp}.json`);
  
  await writeFile(resultsPath, JSON.stringify(results, null, 2));
  
  return results;
};

/**
 * Measure the execution time of a function
 * @param {Function} fn - Function to measure
 * @param {Array} args - Arguments to pass to the function
 * @param {number} iterations - Number of iterations to run
 * @returns {Object} - Performance metrics
 */
export const measureFunctionPerformance = async (fn, args = [], iterations = 1) => {
  const times = [];
  let totalTime = 0;
  let minTime = Infinity;
  let maxTime = 0;
  
  console.log(`Measuring performance of ${fn.name} for ${iterations} iterations`);
  
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    await fn(...args);
    const end = process.hrtime.bigint();
    
    const timeMs = Number(end - start) / 1_000_000;
    times.push(timeMs);
    totalTime += timeMs;
    
    if (timeMs < minTime) minTime = timeMs;
    if (timeMs > maxTime) maxTime = timeMs;
  }
  
  const avgTime = totalTime / iterations;
  
  return {
    function: fn.name,
    iterations,
    totalTimeMs: totalTime,
    avgTimeMs: avgTime,
    minTimeMs: minTime,
    maxTimeMs: maxTime,
    times
  };
};

/**
 * Compare the performance of two functions
 * @param {Function} fn1 - First function to compare
 * @param {Function} fn2 - Second function to compare
 * @param {Array} args - Arguments to pass to both functions
 * @param {number} iterations - Number of iterations to run
 * @returns {Object} - Comparison results
 */
export const compareFunctionPerformance = async (fn1, fn2, args = [], iterations = 10) => {
  console.log(`Comparing performance of ${fn1.name} vs ${fn2.name}`);
  
  const results1 = await measureFunctionPerformance(fn1, args, iterations);
  const results2 = await measureFunctionPerformance(fn2, args, iterations);
  
  const improvement = (results1.avgTimeMs - results2.avgTimeMs) / results1.avgTimeMs * 100;
  
  return {
    original: results1,
    optimized: results2,
    improvementPercent: improvement,
    fasterBy: `${improvement.toFixed(2)}%`
  };
};

/**
 * Run a benchmark comparing sequential vs parallel processing
 * @param {Function} sequentialFn - Sequential processing function
 * @param {Function} parallelFn - Parallel processing function
 * @param {Array} args - Arguments to pass to both functions
 * @returns {Object} - Benchmark results
 */
export const benchmarkSequentialVsParallel = async (sequentialFn, parallelFn, args = []) => {
  console.log('Benchmarking sequential vs parallel processing');
  
  const sequentialStart = process.hrtime.bigint();
  const sequentialResult = await sequentialFn(...args);
  const sequentialEnd = process.hrtime.bigint();
  
  const parallelStart = process.hrtime.bigint();
  const parallelResult = await parallelFn(...args);
  const parallelEnd = process.hrtime.bigint();
  
  const sequentialTime = Number(sequentialEnd - sequentialStart) / 1_000_000;
  const parallelTime = Number(parallelEnd - parallelStart) / 1_000_000;
  
  const improvement = (sequentialTime - parallelTime) / sequentialTime * 100;
  
  return {
    sequential: {
      function: sequentialFn.name,
      timeMs: sequentialTime,
      result: sequentialResult
    },
    parallel: {
      function: parallelFn.name,
      timeMs: parallelTime,
      result: parallelResult
    },
    improvementPercent: improvement,
    fasterBy: `${improvement.toFixed(2)}%`
  };
};

/**
 * Run a benchmark comparing cached vs uncached function execution
 * @param {Function} uncachedFn - Function without caching
 * @param {Function} cachedFn - Function with caching
 * @param {Array} args - Arguments to pass to both functions
 * @param {number} iterations - Number of iterations to run
 * @returns {Object} - Benchmark results
 */
export const benchmarkCaching = async (uncachedFn, cachedFn, args = [], iterations = 5) => {
  console.log('Benchmarking uncached vs cached function execution');
  
  const results = [];
  
  const firstUncachedStart = process.hrtime.bigint();
  await uncachedFn(...args);
  const firstUncachedEnd = process.hrtime.bigint();
  
  const firstCachedStart = process.hrtime.bigint();
  await cachedFn(...args);
  const firstCachedEnd = process.hrtime.bigint();
  
  const firstUncachedTime = Number(firstUncachedEnd - firstUncachedStart) / 1_000_000;
  const firstCachedTime = Number(firstCachedEnd - firstCachedStart) / 1_000_000;
  
  results.push({
    iteration: 0,
    uncachedTimeMs: firstUncachedTime,
    cachedTimeMs: firstCachedTime,
    improvement: (firstUncachedTime - firstCachedTime) / firstUncachedTime * 100
  });
  
  for (let i = 1; i < iterations; i++) {
    const uncachedStart = process.hrtime.bigint();
    await uncachedFn(...args);
    const uncachedEnd = process.hrtime.bigint();
    
    const cachedStart = process.hrtime.bigint();
    await cachedFn(...args);
    const cachedEnd = process.hrtime.bigint();
    
    const uncachedTime = Number(uncachedEnd - uncachedStart) / 1_000_000;
    const cachedTime = Number(cachedEnd - cachedStart) / 1_000_000;
    
    results.push({
      iteration: i,
      uncachedTimeMs: uncachedTime,
      cachedTimeMs: cachedTime,
      improvement: (uncachedTime - cachedTime) / uncachedTime * 100
    });
  }
  
  const totalUncachedTime = results.reduce((sum, result) => sum + result.uncachedTimeMs, 0);
  const totalCachedTime = results.reduce((sum, result) => sum + result.cachedTimeMs, 0);
  const avgUncachedTime = totalUncachedTime / iterations;
  const avgCachedTime = totalCachedTime / iterations;
  const avgImprovement = (avgUncachedTime - avgCachedTime) / avgUncachedTime * 100;
  
  return {
    iterations,
    results,
    averages: {
      uncachedTimeMs: avgUncachedTime,
      cachedTimeMs: avgCachedTime,
      improvementPercent: avgImprovement,
      fasterBy: `${avgImprovement.toFixed(2)}%`
    }
  };
};
