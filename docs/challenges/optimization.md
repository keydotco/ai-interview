# Code Optimization Challenges

## Overview
This section contains challenges focused on identifying and improving inefficient code patterns in Node.js applications. Candidates will need to optimize code for better performance while maintaining functionality.

## Challenge 1: Asynchronous Operations Optimization

### Problem Description
The application contains several functions that process data sequentially, which is inefficient for large datasets or multiple independent operations. The challenge is to identify these inefficient patterns and optimize them using asynchronous JavaScript features like Promise.all.

### Files to Examine
- `src/utils/performance/dataProcessor.js`: Contains functions that process data sequentially
- `src/controllers/performanceController.js`: Contains API endpoints that demonstrate inefficient processing

### Example Inefficient Code
```javascript
// Sequential processing - inefficient for large arrays
for (const userId of userIds) {
  const userData = await fetchUserData(userId);
  const processedData = await processUser(userData);
  results.push(processedData);
}
```

### Optimization Goal
Refactor the code to process data in parallel where appropriate, using Promise.all or other asynchronous patterns to improve performance.

### Success Criteria
- Maintain the same functionality and output format
- Significantly reduce processing time for large datasets
- Handle errors appropriately in the parallel implementation
- Document your approach and the performance improvements achieved

## Challenge 2: Caching and Memoization

### Problem Description
The application includes expensive calculations that are repeatedly performed without caching the results. This leads to unnecessary computation and slower response times.

### Files to Examine
- `src/utils/performance/dataProcessor.js`: Contains expensive calculations without caching
- `src/controllers/performanceController.js`: Contains API endpoints that demonstrate the performance issue

### Example Inefficient Code
```javascript
// Expensive calculation performed without caching
const stats = {
  average: calculateAverage(historicalData),
  median: calculateMedian(historicalData),
  standardDeviation: calculateStandardDeviation(historicalData),
  percentiles: calculatePercentiles(historicalData)
};
```

### Optimization Goal
Implement caching or memoization to avoid redundant calculations and improve response times.

### Success Criteria
- Maintain the same functionality and output format
- Significantly reduce response time for repeated calculations
- Implement an appropriate caching strategy (in-memory, LRU cache, etc.)
- Handle cache invalidation appropriately
- Document your approach and the performance improvements achieved

## Challenge 3: N+1 Query Problem

### Problem Description
The application has an API endpoint that demonstrates the N+1 query problem, where it fetches a list of items and then makes a separate query for each item's related data.

### Files to Examine
- `src/controllers/performanceController.js`: Contains the `getUsersWithTasks` endpoint that demonstrates the N+1 query problem

### Example Inefficient Code
```javascript
// Get all users
const users = await userModel.findAll();

// For each user, fetch their tasks separately - N+1 query problem
const usersWithTasks = [];
for (const user of users) {
  const tasks = await taskModel.findByUserId(user.id);
  usersWithTasks.push({
    ...user,
    tasks
  });
}
```

### Optimization Goal
Refactor the code to fetch all the required data efficiently, avoiding the N+1 query pattern.

### Success Criteria
- Maintain the same functionality and output format
- Significantly reduce the number of database queries
- Improve response time for the API endpoint
- Document your approach and the performance improvements achieved

## Performance Testing

The application includes performance testing tools in the `tests/performance` directory. Use these tools to measure and compare the performance of your optimized code against the original implementation.

### Available Testing Tools
- `tests/performance/benchmark.js`: Contains utilities for benchmarking functions and API endpoints

### Example Usage
```javascript
import { compareFunctionPerformance } from '../tests/performance/benchmark.js';
import { processUserData, processUserDataOptimized } from '../src/utils/performance/dataProcessor.js';

// Compare performance of original vs optimized implementation
const results = await compareFunctionPerformance(
  processUserData,
  processUserDataOptimized,
  [[1, 2, 3, 4, 5]],
  5
);

console.log(`Optimization improved performance by ${results.fasterBy}`);
```

## Submission Guidelines
- Document your optimization approach for each challenge
- Include before/after performance metrics
- Explain any trade-offs in your implementation
- Ensure all tests pass with your optimized code
