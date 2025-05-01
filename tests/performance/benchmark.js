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
  
  // Try to save results to file, but continue if it fails
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const resultsPath = path.join(__dirname, 'results', `benchmark-${timestamp}.json`);
    
    await writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${resultsPath}`);
  } catch (error) {
    console.log(`Note: Could not save results to file (${error.code}). Continuing with benchmark.`);
  }
  
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

/**
 * Format benchmark results for console output
 * @param {Object} results - Benchmark results to format
 * @returns {String} - Formatted results string
 */
const formatResults = (results) => {
  const formatObject = (obj, indent = 0) => {
    const spaces = ' '.repeat(indent);
    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return `${spaces}${key}:\n${formatObject(value, indent + 2)}`;
        } else if (Array.isArray(value) && typeof value[0] === 'object') {
          return `${spaces}${key}: [\n${value.map(item => formatObject(item, indent + 4)).join(',\n')}\n${spaces}]`;
        } else if (typeof value === 'number') {
          return `${spaces}${key}: ${value.toFixed(2)}`;
        } else {
          return `${spaces}${key}: ${value}`;
        }
      })
      .join('\n');
  };
  
  return formatObject(results);
};

/**
 * Sample functions for benchmarking
 */
const slowFibonacci = (n) => {
  if (n <= 1) return n;
  return slowFibonacci(n - 1) + slowFibonacci(n - 2);
};

const fastFibonacci = (n) => {
  const fib = [0, 1];
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  return fib[n];
};

const sequentialProcess = async (items) => {
  const results = [];
  for (const item of items) {
    results.push(await processItem(item));
  }
  return results;
};

const parallelProcess = async (items) => {
  return Promise.all(items.map(item => processItem(item)));
};

const processItem = async (item) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(item * 2), 50);
  });
};

// Cached function implementation
const cache = new Map();
const uncachedCalculation = async (n) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return n * n;
};

const cachedCalculation = async (n) => {
  if (cache.has(n)) {
    return cache.get(n);
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  const result = n * n;
  cache.set(n, result);
  return result;
};
/**
 * Run all benchmarks
 */
const runAllBenchmarks = async () => {
  console.log('===== BENCHMARK RESULTS =====\n');
  
  // 1. Function Performance Comparison
  console.log('📊 Comparing slow vs fast Fibonacci functions:');
  const fibResults = await compareFunctionPerformance(slowFibonacci, fastFibonacci, [20], 5);
  console.log(formatResults(fibResults));
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 2. Sequential vs Parallel
  console.log('📊 Comparing sequential vs parallel processing:');
  const parallelResults = await benchmarkSequentialVsParallel(
    sequentialProcess, 
    parallelProcess, 
    [[1, 2, 3, 4, 5]]
  );
  console.log(formatResults(parallelResults));
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 3. Caching benchmark
  console.log('📊 Comparing cached vs uncached calculation:');
  const cachingResults = await benchmarkCaching(
    uncachedCalculation,
    cachedCalculation,
    [42],
    5
  );
  console.log(formatResults(cachingResults));
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 4. HTTP Benchmarks
  console.log('📊 Running HTTP benchmarks against API endpoints:');
  console.log('Note: Server should already be running on localhost:3000');
  
  // Helper function to format and display HTTP benchmark results
  const displayHttpResults = (name, results) => {
    console.log(`\n--- ${name} Benchmark Results ---`);
    console.log(formatResults({
      requests: {
        total: results.requests.total,
        average: results.requests.average,
        sent: results.requests.sent
      },
      latency: {
        avg: results.latency.average,
        min: results.latency.min,
        max: results.latency.max,
        p99: results.latency.p99
      },
      throughput: {
        avg: results.throughput.average,
        min: results.throughput.min,
        max: results.throughput.max
      }
    }));
  };
  
  try {
    console.log('\n🔍 Testing Health Endpoint (baseline):');
    const healthResults = await runHttpBenchmark({
      url: 'http://localhost:3000/health',
      connections: 10,
      duration: 5,
      method: 'GET'
    });
    displayHttpResults('Health Endpoint', healthResults);
    
    console.log('\n🔍 Testing Process Users Endpoint:');
    const processUsersResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/process-users',
      connections: 5,
      duration: 5,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds: ['user1', 'user2', 'user3', 'user4', 'user5']
      })
    });
    displayHttpResults('Process Users Endpoint', processUsersResults);
    
    console.log('\n🔍 Testing User Statistics Endpoint:');
    const userStatsResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/user-statistics/user1?dataPoints=50',
      connections: 5,
      duration: 5,
      method: 'GET'
    });
    displayHttpResults('User Statistics Endpoint', userStatsResults);
    
    console.log('\n🔍 Testing Read Files Endpoint:');
    const readFilesResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/read-files',
      connections: 5,
      duration: 5,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePaths: [
          'package.json',
          'README.md',
          '.env.example'
        ]
      })
    });
    displayHttpResults('Read Files Endpoint', readFilesResults);
    
    console.log('\n🔍 Testing Users with Tasks Endpoint:');
    const usersWithTasksResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/users-with-tasks',
      connections: 5,
      duration: 5,
      method: 'GET'
    });
    displayHttpResults('Users with Tasks Endpoint', usersWithTasksResults);
    
  } catch (error) {
    console.error('Error running HTTP benchmarks:', error.message);
    console.log('Make sure your server is running on http://localhost:3000');
  }
  
  console.log('\n===== END OF BENCHMARKS =====');
};

// Run the benchmarks
runAllBenchmarks().catch(error => {
  console.error('Error running benchmarks:', error);
  process.exit(1);
});
