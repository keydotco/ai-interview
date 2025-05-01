/**
 * Performance benchmarking utility
 * 
 * This utility provides tools for benchmarking the performance of API endpoints
 * and functions in the application. It uses autocannon for HTTP benchmarking
 * and provides utilities for measuring function execution time.
 * 
 * Run this file to benchmark the performance routes:
 * node tests/performance/benchmark.js
 */

import autocannon from 'autocannon';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

/**
 * Display HTTP benchmark results in a readable format
 * @param {string} name - Name of the benchmark
 * @param {Object} results - Results from runHttpBenchmark
 */
const displayHttpResults = (name, results) => {
  console.log(`\n📊 ${name} Results:`);
  console.log(`  Requests: ${results.requests.total}`);
  console.log(`  Throughput: ${results.requests.average} req/sec`);
  console.log(`  Latency (avg): ${results.latency.average.toFixed(2)}ms`);
  console.log(`  Latency (min): ${results.latency.min}ms`);
  console.log(`  Latency (max): ${results.latency.max}ms`);
  console.log(`  Errors: ${results.errors}`);
};

/**
 * Compare results between optimized and unoptimized endpoints
 * @param {string} name - Name of the comparison
 * @param {Object} unoptimizedResults - Results from unoptimized endpoint
 * @param {Object} optimizedResults - Results from optimized endpoint
 */
const compareResults = (name, unoptimizedResults, optimizedResults) => {
  const unoptimizedLatency = unoptimizedResults.latency.average;
  const optimizedLatency = optimizedResults.latency.average;
  const improvement = ((unoptimizedLatency - optimizedLatency) / unoptimizedLatency * 100).toFixed(2);
  
  const unoptimizedThroughput = unoptimizedResults.requests.average;
  const optimizedThroughput = optimizedResults.requests.average;
  const throughputImprovement = ((optimizedThroughput - unoptimizedThroughput) / unoptimizedThroughput * 100).toFixed(2);
  
  console.log(`\n🔍 ${name} Comparison:`);
  console.log(`  Unoptimized latency: ${unoptimizedLatency.toFixed(2)}ms`);
  console.log(`  Optimized latency: ${optimizedLatency.toFixed(2)}ms`);
  console.log(`  Latency improvement: ${improvement}%`);
  console.log(`  Unoptimized throughput: ${unoptimizedThroughput.toFixed(2)} req/sec`);
  console.log(`  Optimized throughput: ${optimizedThroughput.toFixed(2)} req/sec`);
  console.log(`  Throughput improvement: ${throughputImprovement}%`);
};

/**
 * Main function to run all benchmarks
 */
const runBenchmarks = async () => {
  try {
    console.log('🚀 Starting Performance Benchmarks');
    console.log('=================================');
    
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      await mkdir(resultsDir, { recursive: true });
    }
    
    // 1. Process Users endpoints
    console.log('\n🔍 Testing Process Users Endpoint:');
    const processUsersResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/process-users',
      connections: 5,
      duration: 5,
      method: 'POST',
      body: JSON.stringify({ userIds: [1, 2, 3, 4, 5] }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    displayHttpResults('Process Users Endpoint', processUsersResults);
    
    console.log('\n🔍 Testing Process Users Optimized Endpoint:');
    const processUsersOptimizedResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/process-users-optimized',
      connections: 5,
      duration: 5,
      method: 'POST',
      body: JSON.stringify({ userIds: [1, 2, 3, 4, 5] }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    displayHttpResults('Process Users Optimized Endpoint', processUsersOptimizedResults);
    
    // 2. User Statistics endpoints
    console.log('\n🔍 Testing User Statistics Endpoint:');
    const userStatsResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/user-statistics/1?dataPoints=100',
      connections: 5,
      duration: 5,
      method: 'GET'
    });
    displayHttpResults('User Statistics Endpoint', userStatsResults);
    
    console.log('\n🔍 Testing User Statistics Optimized Endpoint:');
    const userStatsOptimizedResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/user-statistics-optimized/1?dataPoints=100',
      connections: 5,
      duration: 5,
      method: 'GET'
    });
    displayHttpResults('User Statistics Optimized Endpoint', userStatsOptimizedResults);
    
    // 3. Read Files endpoints
    console.log('\n🔍 Testing Read Files Endpoint:');
    const readFilesResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/read-files',
      connections: 5,
      duration: 5,
      method: 'POST',
      body: JSON.stringify({ 
        filePaths: [
          path.join(__dirname, '../unit/models/taskModel.test.js'),
          path.join(__dirname, '../unit/utils/config.test.js'),
          path.join(__dirname, '../unit/middleware/errorHandler.test.js')
        ] 
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    displayHttpResults('Read Files Endpoint', readFilesResults);
    
    console.log('\n🔍 Testing Read Files Optimized Endpoint:');
    const readFilesOptimizedResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/read-files-optimized',
      connections: 5,
      duration: 5,
      method: 'POST',
      body: JSON.stringify({ 
        filePaths: [
          path.join(__dirname, '../unit/models/taskModel.test.js'),
          path.join(__dirname, '../unit/utils/config.test.js'),
          path.join(__dirname, '../unit/middleware/errorHandler.test.js')
        ] 
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    displayHttpResults('Read Files Optimized Endpoint', readFilesOptimizedResults);
    
    // 4. Users with Tasks endpoints
    console.log('\n🔍 Testing Users with Tasks Endpoint:');
    const usersWithTasksResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/users-with-tasks',
      connections: 5,
      duration: 5,
      method: 'GET'
    });
    displayHttpResults('Users with Tasks Endpoint', usersWithTasksResults);
    
    console.log('\n🔍 Testing Users with Tasks Optimized Endpoint:');
    const usersWithTasksOptimizedResults = await runHttpBenchmark({
      url: 'http://localhost:3000/api/performance/users-with-tasks-optimized',
      connections: 5,
      duration: 5,
      method: 'GET'
    });
    displayHttpResults('Users with Tasks Optimized Endpoint', usersWithTasksOptimizedResults);
    
    console.log('\n📈 Performance Comparison: Optimized vs Unoptimized');
    console.log('=================================================');
    
    compareResults('Process Users', processUsersResults, processUsersOptimizedResults);
    compareResults('User Statistics', userStatsResults, userStatsOptimizedResults);
    compareResults('Read Files', readFilesResults, readFilesOptimizedResults);
    compareResults('Users with Tasks', usersWithTasksResults, usersWithTasksOptimizedResults);
    
    console.log('\n✅ Benchmarks completed successfully');
    console.log('\nThese benchmarks demonstrate the performance improvements achieved by:');
    console.log('1. Using Promise.all for parallel processing instead of sequential processing');
    console.log('2. Implementing caching for expensive calculations');
    console.log('3. Optimizing database queries to avoid the N+1 query problem');
    console.log('4. Reading files in parallel instead of sequentially');
    
  } catch (error) {
    console.error('❌ Error running benchmarks:', error);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runBenchmarks();
}
