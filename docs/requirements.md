# Project Requirements

## Overview
The AI Interview project is designed to evaluate a candidate's ability to effectively collaborate with AI coding assistants. The application is a Node.js Express API that includes various challenges to test different AI collaboration patterns.

## Challenge Types

### 1. Bug Fixing Challenge
- 3-5 bugs of varying complexity in the NodeJS codebase
- Bugs represent common Node.js/JavaScript errors:
  - Asynchronous execution issues (Promise handling, callback problems)
  - Memory leaks or inefficient closures
  - Race conditions
  - Error handling gaps in Express middleware
  - Edge cases in data validation
- At least one bug should be subtle enough that it requires careful explanation to AI
- Failing Jest tests indicate the presence of bugs

### 2. Feature Implementation Challenge
- Clear requirements for 1-2 new features in the Node.js application
- Feature examples:
  - Adding a new API endpoint with proper validation, error handling, and testing
  - Adding authentication middleware with JWT validation
- Features require understanding of the Express/Node.js architecture
- Acceptance criteria can be validated with tests
- Features are scoped to be completable in 15-30 minutes with AI assistance

### 3. Code Optimization Challenge
- Functioning but inefficient Node.js code
- Opportunities for:
  - Asynchronous operation improvements (Promise.all vs sequential execution)
  - API response time improvements
- Performance testing tools like autocannon or loadtest
- Metrics or benchmarks to measure improvements
- At least one expensive operation that could benefit from caching or memoization

### 4. Documentation Gap Challenge
- Portions of the codebase are deliberately poorly documented
- Tasks require candidates to generate documentation
- Functions require thorough understanding to document properly

## Technical Requirements

### NodeJS Specifics
- Target the latest LTS version of Node.js (v20.x)
- Utilize modern JavaScript features (ES6+, async/await)
- Use ES Module pattern

### Dependencies
- Express.js for the web framework
- Jest for testing
- One less common library with sparse documentation (e.g., a specific validation, caching, or logging library)

### Code Complexity
- Mix of simple and complex functions
- At least one algorithm of moderate complexity
- Variety of programming patterns and paradigms

## Interview Features

### Deliberate Ambiguities
- At least one task with intentionally vague requirements
- Scenarios where clarification would be beneficial

### "AI Trap" Scenarios
- Node.js-specific code patterns where AI tools typically give suboptimal solutions:
  - Complex async/await patterns that AI might simplify incorrectly
  - Express middleware order dependencies that require careful consideration
  - Error handling patterns specific to Node.js that AI might oversimplify
- Scenarios where blindly following AI advice would lead to issues
- At least one case where the AI's suggested "best practice" might conflict with project-specific requirements

### Time-Boxed Challenges
- Tasks that can be reasonably completed in the interview timeframe
- Stretch goals for candidates who progress quickly
