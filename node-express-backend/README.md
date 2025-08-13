#  Node.js Express Backend - Task Manager API

A robust, scalable backend API built with Node.js, Express, and PostgreSQL, featuring comprehensive testing coverage including unit tests, integration tests, and load testing with Grafana K6.

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Testing Suite](#-testing-suite)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **JWT Authentication** with role-based access control
- 👥 **User Management** with admin and regular user roles
- 📝 **Task Management** with CRUD operations
- 🏷️ **Category Management** for task organization
- 🚀 **High Performance** with optimized database queries
- 🛡️ **Security** with input validation and rate limiting
- 📊 **Comprehensive Testing** with 90%+ code coverage
- 🔄 **Real-time Updates** with WebSocket support

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcryptjs
- **Testing**: Jest + Supertest + K6
- **Validation**: Zod schemas
- **Logging**: Winston logger
- **Rate Limiting**: Express rate limiter
- **CORS**: Cross-origin resource sharing

##  Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/angular-task-manager.git
   cd angular-task-manager/node-express-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Update .env with your database credentials
   ```

4. **Database setup**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start the server**
   ```bash
   pnpm dev
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/users` | Get all users | Admin |
| GET | `/auth/users/:id` | Get user by ID | Admin |
| PUT | `/auth/users/:id` | Update user | Admin |
| POST | `/auth/users/:id/deactivate` | Deactivate user | Admin |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks | Yes |
| POST | `/tasks` | Create new task | Yes |
| GET | `/tasks/:id` | Get task by ID | Yes |
| PUT | `/tasks/:id` | Update task | Yes |
| DELETE | `/tasks/:id` | Delete task | Yes |
| PATCH | `/tasks/:id/complete` | Mark task complete | Yes |

### Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | Yes |
| POST | `/categories` | Create new category | Yes |
| GET | `/categories/:id` | Get category by ID | Yes |
| PUT | `/categories/:id` | Update category | Yes |
| DELETE | `/categories/:id` | Delete category | Yes |


## 🧪 Test Cases
![Test Cases](images_tests/test-cases.png)

## 🧪 Testing Suite

Our comprehensive testing strategy ensures code quality, reliability, and performance across all application layers.

###  Testing Overview

![Testing Overview](image_tests/unit_and_intergration_tests.png)

*Comprehensive testing coverage across unit, integration, and load testing*

### 📊 Test Coverage Summary

| Test Type | Count | Coverage | Purpose |
|-----------|-------|----------|---------|
| **Unit Tests** | 20 | 90%+ | Individual component testing |
| **Integration Tests** | 20 | 85%+ | Component interaction testing |
| **Smoke Tests** | 20 | 100% | Basic functionality validation |
| **Spike Tests** | 20 | 100% | Sudden load handling |
| **Stress Tests** | 20 | 100% | System limits and recovery |

### 🔬 Unit Testing

![Unit Testing](images/unit-testing.png)

*Testing individual functions, services, and middleware in isolation*

**Key Areas Covered:**
-  Authentication Services (Login, Registration, Password handling)
-  Business Services (Task, Category, User management)
-  Middleware (JWT validation, Role-based access control)
-  Validation (Data validation and sanitization)
-  Utilities (Helper functions and common operations)

**Example Unit Test:**
```typescript
describe('Auth Service - User Login', () => {
  it('should login user with valid credentials', async () => {
    // Arrange
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    // Act
    const result = await userLoginService(validCredentials);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
  });
});
```

### 🔗 Integration Testing

![Integration Testing](images/integration-testing.png)

*Testing how different components work together*

**Key Areas Covered:**
-  API Endpoints (Complete CRUD operations)
-  Database Integration (Connection, queries, transactions)
-  Authentication Flow (JWT token generation and validation)
-  Error Handling (Global error handling and responses)
-  Security (Headers, validation, authorization)

**Example Integration Test:**
```typescript
describe('Task API Integration', () => {
  it('should complete task CRUD flow', async () => {
    // Create task
    const createResponse = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(validTaskData);
    
    expect(createResponse.status).toBe(201);
    
    // Retrieve task
    const taskId = createResponse.body.id;
    const getResponse = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(getResponse.status).toBe(200);
  });
});
```

### 📈 Load Testing with K6

![Load Testing](images/load-testing.png)

*Performance testing under various load conditions*

#### 🚬 Smoke Tests
![Smoke Tests](images/smoke-tests.png)

*Basic functionality validation under normal conditions*

**Test Scenarios:**
- Authentication flows (Login, Registration)
- CRUD operations for all entities
- Error handling and validation
- Database connectivity
- Response time validation

**Execution:**
```bash
# Run all smoke tests
k6 run load-tests/smoke/runner.smoke.ts

# Run individual smoke tests
k6 run load-tests/smoke/login.smoke.ts
k6 run load-tests/smoke/task.smoke.ts
```

#### ⚡ Spike Tests
![Spike Tests](images/spike-tests.png)

*Testing system behavior under sudden load spikes*

**Load Pattern:**
- Baseline: 10 users (30s)
- Spike: 10 → 100 users (1m)
- Sustained: 100 users (2m)
- Recovery: 100 → 20 users (1m)
- Final Peak: 20 → 150 users (1m)

**Execution:**
```bash
k6 run load-tests/spike/task.spike.ts
```

#### 💪 Stress Tests
![Stress Tests](images/stress-tests.png)

*Pushing system to its limits and beyond*

**Load Stages:**
- Moderate: 50 users (7m)
- High: 150 users (13m)
- Peak: 300 users (13m)
- Overload: 500 users (5m)
- Recovery: 100 users (5m)

**Execution:**
```bash
k6 run load-tests/stress/tasks.stress.ts
```

### 📋 Test Case Documentation

![Test Cases](images/test-cases.png)

*Comprehensive test case documentation in Excel format*

**Available Test Case Files:**
- `test_cases_smoke.xlsx` - 20 smoke test scenarios
- `test_cases_spike.xlsx` - 20 spike test scenarios  
- `test_cases_stress.xlsx` - 20 stress test scenarios
- `test_cases_unit_integration.xlsx` - 40 unit + integration test scenarios

### 🎯 Test Execution Plan

![Test Execution Plan](images/test-execution-plan.png)

*Structured approach to running all test types*

**Execution Order:**
1. **Unit Tests** - Foundation testing
2. **Integration Tests** - Component interaction testing
3. **Smoke Tests** - Basic functionality validation
4. **Spike Tests** - Load variability testing
5. **Stress Tests** - System limits testing

### 📊 Test Results Template

![Test Results](images/test-results.png)

*Standardized format for recording test execution results*

**Results Tracking:**
- Test execution status (Pass/Fail)
- Performance metrics (Response times, Error rates)
- Coverage reports
- Recommendations and next steps

## 🏗️ Project Structure

```
node-express-backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── tasks/          # Task management module
│   ├── category/       # Category management module
│   ├── middleware/     # Custom middleware
│   ├── drizzle/        # Database configuration
│   ├── config/         # Configuration files
│   ├── server.ts       # Express app setup
│   └── index.ts        # Server entry point
├── load-tests/         # K6 load testing scripts
│   ├── smoke/          # Smoke tests
│   ├── spike/          # Spike tests
│   └── stress/         # Stress tests
├── test/               # Jest test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── setup/          # Test configuration
├── docs/               # Documentation
├── images/             # README images
└── README.md           # This file
```

## 🚀 Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Load Tests

```bash
# Install K6 (if not already installed)
# Windows: choco install k6
# macOS: brew install k6
# Linux: https://k6.io/docs/getting-started/installation/

# Run smoke tests
k6 run load-tests/smoke/runner.smoke.ts

# Run spike tests
k6 run load-tests/spike/task.spike.ts

# Run stress tests
k6 run load-tests/stress/tasks.stress.ts
```

### Test Scripts

```bash
# Quick test execution
pnpm smoke:all      # Run all smoke tests
pnpm spike:task     # Run task spike test
pnpm stress:task    # Run task stress test

# Combined testing
pnpm test:all       # Run all test types
pnpm test:coverage  # Generate coverage report
```

## 📊 Performance Metrics

### Response Time Targets

| Test Type | 95th Percentile | 99th Percentile | Error Rate |
|-----------|-----------------|-----------------|------------|
| **Smoke Tests** | < 800ms | < 1s | < 20% |
| **Spike Tests** | < 2s | < 3s | < 30% |
| **Stress Tests** | < 5s | < 8s | < 50% |

### Load Capacity

| Test Type | Max Users | Duration | Purpose |
|-----------|-----------|----------|---------|
| **Smoke** | 1 | 2 min | Functionality validation |
| **Spike** | 150 | 7 min | Sudden load handling |
| **Stress** | 500 | 43 min | System limits testing |

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=user
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start

# Run with PM2
pm2 start ecosystem.config.js
```

### Docker Deployment

```bash
# Build Docker image
docker build -t task-manager-api .

# Run container
docker run -p 5000:5000 task-manager-api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Maintain 90%+ code coverage
- Follow ESLint configuration
- Update documentation as needed
- Run full test suite before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Drizzle ORM](https://orm.drizzle.team/) - Database toolkit
- [Jest](https://jestjs.io/) - Testing framework
- [Grafana K6](https://k6.io/) - Load testing tool
- [PostgreSQL](https://www.postgresql.org/) - Database

## 📞 Support

For support and questions:
- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/angular-task-manager/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/angular-task-manager/wiki)

---

<div align="center">

**Built with ❤️ and comprehensive testing**

[![Test Coverage](images/test-coverage-badge.png)](https://github.com/yourusername/angular-task-manager)
[![Build Status](images/build-status-badge.png)](https://github.com/yourusername/angular-task-manager/actions)
[![Code Quality](images/code-quality-badge.png)](https://github.com/yourusername/angular-task-manager)

</div>
