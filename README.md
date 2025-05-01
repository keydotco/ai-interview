# AI Interview Project

## Overview
This project is designed to evaluate a candidate's ability to effectively collaborate with AI coding assistants (like Claude + Cursor). The repository includes a variety of challenges that test different AI collaboration patterns while maintaining a realistic development environment.

## Challenges
The repository contains four types of challenges:

1. **Bug Fixing Challenge**: Find and fix bugs of varying complexity in the codebase
2. **Feature Implementation Challenge**: Implement new features based on requirements
3. **Code Optimization Challenge**: Improve inefficient code to enhance performance
4. **Documentation Gap Challenge**: Generate documentation for poorly documented code

## Setup Instructions

### Prerequisites
- Node.js (v20.x LTS)
- npm (v10.x)
- Docker (optional, for containerized environment)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/keydotco/ai-interview.git
   cd ai-interview
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your specific configuration.

### Running the Application
- Development mode:
  ```
  npm run dev
  ```

- Run tests:
  ```
  npm test
  ```

- Lint code:
  ```
  npm run lint
  ```

- Performance testing:
  ```
  npm run benchmark
  ```

## Docker Setup
For a consistent environment, you can use Docker:

```
docker-compose up
```

## Project Structure
```
ai-interview/
├── README.md                     # Introduction and setup instructions
├── docs/                         # Documentation
├── src/                          # Source code
├── tests/                        # Test suite
├── config/                       # Configuration files
├── .env.example                  # Environment variables template
├── package.json                  # Node dependencies
└── index.js                      # Application entry point
```

## License
Private - Key.co
