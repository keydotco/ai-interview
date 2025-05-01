# Task Search Feature

## Overview
Implement a search and filter functionality for tasks to allow users to find tasks based on various criteria.

## Requirements

### Core Requirements
1. Create a new endpoint for searching and filtering tasks
2. Implement query parameter parsing and validation
3. Support multiple filter criteria (status, priority, date range, etc.)
4. Return paginated results with metadata

### Technical Specifications
- Endpoint should accept query parameters for filtering
- Implement validation for query parameters
- Support sorting by different fields
- Support pagination with customizable page size
- Return metadata about the search results (total count, page info)

### API Endpoint

#### GET /api/tasks/search
- Search and filter tasks based on query parameters
- Query Parameters:
  - `status`: Filter by task status (pending, in-progress, completed)
  - `priority`: Filter by task priority (low, medium, high)
  - `userId`: Filter by user ID
  - `fromDate`: Filter tasks created after this date
  - `toDate`: Filter tasks created before this date
  - `query`: Text search in title and description
  - `sort`: Field to sort by (createdAt, updatedAt, dueDate, priority)
  - `order`: Sort order (asc, desc)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 50)

- Response:
  ```json
  {
    "tasks": [
      {
        "id": "task-id",
        "title": "Task Title",
        "description": "Task Description",
        "status": "pending",
        "priority": "medium",
        "userId": "user-id",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "dueDate": "2023-01-15T00:00:00.000Z"
      }
    ],
    "metadata": {
      "totalCount": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
  ```

### Implementation Details
- Use query parameter validation with appropriate error messages
- Implement efficient filtering logic in the task service
- Handle edge cases like invalid date formats or non-existent fields
- Implement proper error handling for all scenarios

## Acceptance Criteria
1. Users can search for tasks using various filter criteria
2. Search results are paginated with customizable page size
3. Response includes metadata about the search results
4. Invalid query parameters return appropriate error messages
5. Empty result sets return a 200 status with empty array and correct metadata

## Testing
- Unit tests for query parameter validation
- Unit tests for the search service logic
- Integration tests for the search endpoint with various filter combinations
- Tests for edge cases and error handling

## Stretch Goals
1. Implement advanced text search with relevance scoring
2. Add support for complex filtering with AND/OR logic
3. Implement caching for frequent searches
4. Add field selection to allow clients to request only specific fields
