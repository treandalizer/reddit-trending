# Testing Guide

This document describes the testing setup and how to run tests for the Reddit Explorer application.

## Test Commands

Since the test scripts need to be manually added to package.json, here are the commands to run tests:

```bash
# Run all tests once
npx vitest run

# Run tests in watch mode (development)
npx vitest

# Run tests with coverage
npx vitest run --coverage

# Run tests with UI
npx vitest --ui

# Run type checking
npm run check

# Run build test
npm run build
```

## Test Structure

```
src/test/
├── setup.ts                 # Test setup and configuration
├── mocks/
│   └── server.ts            # Mock Service Worker setup
├── components/
│   ├── PostCard.test.tsx    # PostCard component tests
│   └── SearchForm.test.tsx  # SearchForm component tests
├── pages/
│   └── Home.test.tsx        # Home page tests
├── server/
│   ├── routes.test.ts       # API route tests
│   └── storage.test.ts      # Storage layer tests
├── shared/
│   └── schema.test.ts       # Schema validation tests
└── utils/
    └── testUtils.tsx        # Test utilities and helpers
```

## Test Categories

### 1. Component Tests
- **PostCard.test.tsx**: Tests post card rendering, data display, and interactions
- **SearchForm.test.tsx**: Tests form validation, user interactions, and submissions
- **Home.test.tsx**: Tests main page functionality, tab switching, and layout

### 2. Server Tests
- **routes.test.ts**: Tests API endpoints, request/response handling, and error cases
- **storage.test.ts**: Tests data storage operations, caching, and retrieval

### 3. Schema Tests
- **schema.test.ts**: Tests data validation, type checking, and schema compliance

### 4. Integration Tests
- Uses Mock Service Worker (MSW) to mock API responses
- Tests complete user workflows and component interactions

## Test Configuration

### Vitest Configuration
The tests use Vitest with the following setup:
- **Environment**: jsdom for DOM testing
- **Test Framework**: Vitest with React Testing Library
- **Mocking**: MSW for API mocking
- **Coverage**: Built-in coverage reporting

### Key Features
- **TypeScript Support**: Full TypeScript integration
- **Mock Service Worker**: Realistic API mocking
- **React Testing Library**: Component testing utilities
- **Path Aliases**: Same path aliases as the main application (@, @shared)

## GitHub Actions CI/CD

The project includes a comprehensive GitHub Actions workflow:

### Workflow Triggers
- Push to `main` and `develop` branches
- Pull requests to `main` branch

### Pipeline Stages

1. **Test Stage**
   - Runs on Node.js 18.x and 20.x
   - Type checking with TypeScript
   - Unit tests with coverage
   - Uploads coverage reports to Codecov

2. **Build Stage**
   - Builds the application
   - Runs build verification tests
   - Uploads build artifacts

3. **Security Stage**
   - Runs npm audit for security vulnerabilities
   - Checks for outdated dependencies

4. **Deployment Stages**
   - **Staging**: Deploys to staging on `develop` branch
   - **Production**: Deploys to production on `main` branch
   - Runs smoke tests and post-deployment verification

5. **Notification Stage**
   - Notifies on success/failure
   - Provides clear feedback on pipeline status

## Running Tests Locally

### Prerequisites
- Node.js 18.x or 20.x
- npm dependencies installed

### Commands
```bash
# Install dependencies
npm install

# Run all tests
npx vitest run

# Run specific test file
npx vitest run src/test/components/PostCard.test.tsx

# Run tests with coverage
npx vitest run --coverage

# Run tests in watch mode
npx vitest

# Run tests with UI
npx vitest --ui

# Type checking
npm run check

# Build verification
npm run build
```

## Test Coverage

The tests cover:
- **Component rendering** and user interactions
- **API endpoint** functionality and error handling
- **Data validation** and schema compliance
- **Storage operations** and caching logic
- **Form validation** and user input handling
- **Error states** and edge cases

## Adding New Tests

### Component Tests
1. Create test file: `src/test/components/ComponentName.test.tsx`
2. Import testing utilities: `@testing-library/react`, `vitest`
3. Use TestWrapper for providers (QueryClient, Tooltips, etc.)
4. Test rendering, user interactions, and state changes

### API Tests
1. Create test file: `src/test/server/endpoint.test.ts`
2. Use `supertest` for HTTP testing
3. Mock storage and external dependencies
4. Test success cases, error cases, and validation

### Schema Tests
1. Create test file: `src/test/shared/schema.test.ts`
2. Import schema from `@shared/schema`
3. Test valid and invalid data scenarios
4. Verify type safety and validation rules

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Use MSW for API mocking
3. **Test User Behavior**: Focus on user interactions, not implementation
4. **Coverage Goals**: Aim for high coverage on critical paths
5. **Descriptive Names**: Use clear, descriptive test names
6. **Arrange-Act-Assert**: Structure tests clearly
7. **Edge Cases**: Test error conditions and boundary cases

## Debugging Tests

1. Use `console.log` in tests for debugging
2. Run single test file: `npx vitest run path/to/test.tsx`
3. Use `--reporter=verbose` for detailed output
4. Check test coverage: `npx vitest run --coverage`
5. Use Vitest UI for interactive debugging: `npx vitest --ui`

This testing setup provides comprehensive coverage and ensures code quality through automated testing and CI/CD integration.