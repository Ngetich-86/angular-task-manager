# Unit and Integration Testing Plan

## Overview
This document outlines the comprehensive testing strategy for your Node.js Express backend, covering both unit tests and integration tests. The plan follows testing best practices and ensures thorough coverage of all application components.

## Testing Strategy

### 1. Unit Testing (UT001-UT020)
**Purpose**: Test individual functions, services, and middleware in isolation
**Framework**: Jest
**Coverage**: Aim for >90% code coverage
**Focus**: Business logic, validation, error handling, edge cases

**Key Areas**:
- **Authentication Services**: User login, registration, password handling
- **Business Services**: Task, category, and user management
- **Middleware**: JWT validation, role-based access control
- **Validation**: Data validation and sanitization
- **Utilities**: Helper functions and common operations

### 2. Integration Testing (IT001-IT020)
**Purpose**: Test how different components work together
**Framework**: Jest + Supertest
**Coverage**: End-to-end workflows and component interactions
**Focus**: API endpoints, database operations, external service integration

**Key Areas**:
- **API Endpoints**: Complete CRUD operations
- **Database Integration**: Connection, queries, transactions
- **Authentication Flow**: JWT token generation and validation
- **Error Handling**: Global error handling and responses
- **Security**: Headers, validation, authorization

## Test Execution Order

### Phase 1: Unit Testing (Foundation)
**Execution Order**: Run unit tests first to ensure individual components work correctly

1. **Authentication Services (UT001-UT005)**
   - Test user login with valid/invalid credentials
   - Test user registration with valid/duplicate data
   - Verify password hashing and JWT generation

2. **Business Services (UT006-UT015)**
   - Test task CRUD operations
   - Test category management
   - Test user management operations

3. **Middleware (UT016-UT019)**
   - Test JWT validation
   - Test role-based access control
   - Verify authentication flow

4. **Validation (UT020)**
   - Test data validation schemas
   - Verify input sanitization

### Phase 2: Integration Testing (Component Interaction)
**Execution Order**: Run integration tests after unit tests pass

1. **Core Functionality (IT001-IT007)**
   - Test complete authentication flows
   - Test complete CRUD operations
   - Test database integration

2. **Security and Validation (IT008-IT014)**
   - Test error handling
   - Test rate limiting
   - Test CORS configuration
   - Test security headers

3. **Advanced Features (IT015-IT020)**
   - Test file handling
   - Test search and filtering
   - Test bulk operations
   - Test health monitoring

## Test Execution Commands

### Unit Tests
```bash
# Run all unit tests
npm test

# Run specific unit test files
npm test -- --testPathPattern=auth.service.test.ts
npm test -- --testPathPattern=task.service.test.ts
npm test -- --testPathPattern=middleware.test.ts

# Run unit tests with coverage
npm run test:coverage

# Run unit tests in watch mode
npm run test:watch
```

### Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific integration test files
npm test -- --testPathPattern=auth.integration.test.ts
npm test -- --testPathPattern=task.integration.test.ts

# Run integration tests with database
npm run test:integration:db
```

### Combined Testing
```bash
# Run all tests (unit + integration)
npm run test:all

# Run tests with specific configuration
npm test -- --config=jest.config.js
```

## Test Environment Setup

### 1. Unit Test Environment
```javascript
// jest.config.js for unit tests
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/server.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup/unit.setup.ts']
};
```

### 2. Integration Test Environment
```javascript
// jest.config.js for integration tests
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/integration.setup.ts'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/test/setup/global.setup.ts',
  globalTeardown: '<rootDir>/test/setup/global.teardown.ts'
};
```

## Mocking Strategy

### 1. Database Mocking
```typescript
// Mock Drizzle database
jest.mock('../src/drizzle/db', () => ({
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));
```

### 2. External Service Mocking
```typescript
// Mock email service
jest.mock('../src/services/email.service', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));
```

### 3. JWT Mocking
```typescript
// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));
```

## Test Data Management

### 1. Test Fixtures
```typescript
// test/fixtures/users.fixture.ts
export const testUsers = {
  validUser: {
    id: 1,
    fullname: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'user'
  },
  adminUser: {
    id: 2,
    fullname: 'Admin User',
    email: 'admin@example.com',
    password: 'hashedPassword123',
    role: 'admin'
  }
};
```

### 2. Test Database Setup
```typescript
// test/setup/database.setup.ts
export const setupTestDatabase = async () => {
  // Create test database schema
  // Insert test data
  // Configure test environment
};

export const teardownTestDatabase = async () => {
  // Clean up test data
  // Drop test database
  // Reset environment
};
```

## Success Criteria

### Unit Tests
- ✅ **Code Coverage**: >90% for all metrics
- ✅ **Test Execution**: All tests pass
- ✅ **Performance**: Tests complete within 30 seconds
- ✅ **Mocking**: All external dependencies properly mocked

### Integration Tests
- ✅ **API Endpoints**: All endpoints respond correctly
- ✅ **Database Operations**: All CRUD operations succeed
- ✅ **Authentication**: JWT flow works end-to-end
- ✅ **Error Handling**: Appropriate error responses
- ✅ **Performance**: Response times < 2 seconds

## Test Reporting

### 1. Coverage Reports
```bash
# Generate HTML coverage report
npm run test:coverage:html

# Generate coverage report for specific modules
npm run test:coverage -- --collectCoverageFrom="src/auth/**/*.ts"
```

### 2. Test Results
```bash
# Generate test results report
npm run test:report

# Export test results to various formats
npm run test:export -- --reporter=json
npm run test:export -- --reporter=junit
```

## Continuous Integration

### 1. GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:coverage
```

### 2. Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit",
      "pre-push": "npm run test:all"
    }
  }
}
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure test database is accessible
2. **Mock Configuration**: Verify all external dependencies are mocked
3. **Test Isolation**: Ensure tests don't interfere with each other
4. **Environment Variables**: Check test environment configuration

### Debug Steps
1. Run tests with verbose output: `npm test -- --verbose`
2. Check test setup files for configuration issues
3. Verify mock implementations are correct
4. Check test database connectivity

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario
- Follow AAA pattern: Arrange, Act, Assert

### 2. Test Data
- Use fixtures for consistent test data
- Clean up test data after each test
- Avoid hardcoded values in tests

### 3. Mocking
- Mock external dependencies, not internal logic
- Use realistic mock data
- Verify mock interactions when relevant

### 4. Assertions
- Test one thing per test case
- Use specific assertions (e.g., `toBe` vs `toBeTruthy`)
- Include error message context

## Next Steps

After implementing the test suite:
1. **Run Tests**: Execute all tests to establish baseline
2. **Analyze Coverage**: Identify areas needing additional tests
3. **Optimize**: Improve test performance and reliability
4. **Automate**: Integrate with CI/CD pipeline
5. **Maintain**: Keep tests updated with code changes

---

**Note**: This testing plan provides comprehensive coverage of your application. Start with unit tests to build confidence in individual components, then move to integration tests to verify component interactions work correctly.
