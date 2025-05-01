# Code Optimization Solutions

## Challenge 1: Asynchronous Operations Optimization

### Problem
The `processUserData` function in `src/utils/performance/dataProcessor.js` processes user data sequentially, which is inefficient for large datasets.

### Solution
Optimize the function to process data in parallel using Promise.all:

```javascript
/**
 * Processes user data in parallel using Promise.all
 * This optimized version processes all users simultaneously
 */
export const processUserDataOptimized = async (userIds) => {
  logger.info(`Processing ${userIds.length} users in parallel`);
  const startTime = Date.now();
  
  const promises = userIds.map(async (userId) => {
    try {
      const userData = await fetchUserData(userId);
      return await processUser(userData);
    } catch (error) {
      logger.error(`Error processing user ${userId}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(promises);
  const filteredResults = results.filter(result => result !== null);
  
  const endTime = Date.now();
  logger.info(`Parallel processing completed in ${endTime - startTime}ms`);
  
  return {
    results: filteredResults,
    processingTime: endTime - startTime
  };
};
```

### Explanation
1. Instead of processing each user sequentially in a for loop, we use `map` to create an array of promises
2. Each promise handles fetching and processing a single user's data
3. We use `Promise.all` to execute all promises in parallel
4. We filter out any null results (from errors) before returning
5. This approach significantly reduces processing time for large datasets

### Performance Improvement
For a dataset of 100 users:
- Sequential processing: ~15,000ms (100 users × 150ms per user)
- Parallel processing: ~150ms (limited by the slowest single operation)

This represents a 100x improvement in processing time for this example.

## Challenge 2: Caching and Memoization

### Problem
The `calculateUserStatistics` function in `src/utils/performance/dataProcessor.js` recalculates the same values repeatedly without caching.

### Solution
Implement a caching mechanism to avoid redundant calculations:

```javascript
// Cache for storing calculated statistics
const statsCache = new Map();

/**
 * Calculates user statistics with caching
 * This optimized version uses memoization to avoid redundant calculations
 */
export const calculateUserStatisticsOptimized = async (userId, dataPoints) => {
  logger.info(`Calculating statistics for user ${userId} with ${dataPoints} data points`);
  const startTime = Date.now();
  
  // Create a cache key based on userId and dataPoints
  const cacheKey = `${userId}-${dataPoints}`;
  
  // Check if we have cached results
  if (statsCache.has(cacheKey)) {
    logger.info(`Using cached statistics for user ${userId}`);
    const cachedResult = statsCache.get(cacheKey);
    
    return {
      ...cachedResult,
      fromCache: true,
      calculationTime: 0
    };
  }
  
  // If not in cache, calculate statistics
  const historicalData = await fetchUserHistoricalData(userId, dataPoints);
  
  const stats = {
    average: calculateAverage(historicalData),
    median: calculateMedian(historicalData),
    standardDeviation: calculateStandardDeviation(historicalData),
    percentiles: calculatePercentiles(historicalData)
  };
  
  const endTime = Date.now();
  const calculationTime = endTime - startTime;
  logger.info(`Statistics calculation completed in ${calculationTime}ms`);
  
  // Store in cache
  const result = {
    userId,
    stats,
    calculationTime,
    cachedAt: new Date().toISOString()
  };
  
  statsCache.set(cacheKey, result);
  
  return result;
};

/**
 * Clears the statistics cache
 * Use this when data changes and cache needs to be invalidated
 */
export const clearStatisticsCache = (userId = null) => {
  if (userId) {
    // Clear cache for specific user
    for (const key of statsCache.keys()) {
      if (key.startsWith(`${userId}-`)) {
        statsCache.delete(key);
      }
    }
    logger.info(`Cleared statistics cache for user ${userId}`);
  } else {
    // Clear entire cache
    statsCache.clear();
    logger.info('Cleared entire statistics cache');
  }
};
```

### Explanation
1. Created a Map to store calculated statistics
2. Generated a cache key based on userId and dataPoints
3. Check the cache before performing calculations
4. Store results in the cache after calculation
5. Added a function to clear the cache when data changes
6. Added metadata to indicate when results come from cache

### Performance Improvement
For repeated calls with the same parameters:
- Without caching: ~300ms per call
- With caching: ~1ms per call (99.7% reduction)

This is especially valuable for frequently accessed statistics that don't change often.

## Challenge 3: N+1 Query Problem

### Problem
The `getUsersWithTasks` method in `src/controllers/performanceController.js` demonstrates the N+1 query problem, where it fetches a list of users and then makes a separate query for each user's tasks.

### Solution
Optimize the function to fetch all tasks in a single query and then associate them with the appropriate users:

```javascript
/**
 * Get users with their tasks - optimized version
 * This version avoids the N+1 query problem by fetching all tasks at once
 */
getUsersWithTasksOptimized: async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Fetch all users in a single query
    const users = await userModel.findAll();
    
    // Get all user IDs
    const userIds = users.map(user => user.id);
    
    // Fetch all tasks for these users in a single query
    const allTasks = await taskModel.findByUserIds(userIds);
    
    // Group tasks by userId
    const tasksByUserId = allTasks.reduce((acc, task) => {
      if (!acc[task.userId]) {
        acc[task.userId] = [];
      }
      acc[task.userId].push(task);
      return acc;
    }, {});
    
    // Associate tasks with their users
    const usersWithTasks = users.map(user => ({
      ...user,
      tasks: tasksByUserId[user.id] || []
    }));
    
    const endTime = Date.now();
    
    res.json({
      users: usersWithTasks,
      processingTime: endTime - startTime
    });
  } catch (error) {
    next(error);
  }
}
```

### Explanation
1. Fetch all users in a single query (unchanged)
2. Extract all user IDs from the users
3. Fetch all tasks for these users in a single query (requires implementing a new `findByUserIds` method in the task model)
4. Group the tasks by userId using reduce
5. Map over the users and associate each user with their tasks

### Implementation of findByUserIds in taskModel
```javascript
/**
 * Find tasks by multiple user IDs
 * @param {string[]} userIds - Array of user IDs
 * @returns {Promise<Array>} - Array of tasks
 */
findByUserIds: async (userIds) => {
  return global.tasks.filter(task => userIds.includes(task.userId));
}
```

### Performance Improvement
For a system with 100 users, each with 10 tasks:
- N+1 approach: 101 queries (1 for users + 100 for tasks)
- Optimized approach: 2 queries (1 for users + 1 for all tasks)

This represents a 50x reduction in the number of database queries.
