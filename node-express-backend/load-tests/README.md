# K6 Load Testing Suite

This directory contains comprehensive load testing scripts using Grafana K6 for the Node.js Express Task Manager backend.

## Prerequisites

1. **Install K6**: Download and install K6 from [https://k6.io/docs/getting-started/installation/](https://k6.io/docs/getting-started/installation/)

2. **Node.js Backend**: Ensure your backend server is running and accessible

3. **Environment Variables**: Set up the following environment variables:
   ```bash
   export JWT_SECRET="your-jwt-secret-key"
   export BASE_URL="http://localhost:3000"  # or your server URL
   ```

## Smoke Tests

Smoke tests are lightweight tests designed to verify that the basic functionality of your application works correctly. They run with minimal load and are perfect for:

- Pre-deployment verification
- Daily health checks
- Quick functionality validation
- CI/CD pipeline integration

### Available Smoke Tests

1. **`login.smoke.ts`** - Tests authentication endpoints
   - Valid login scenarios
   - Invalid credentials
   - Missing fields
   - Error handling

2. **`register.smoke.ts`** - Tests user registration
   - Successful registration
   - Duplicate user handling
   - Validation errors
   - Field requirements

3. **`task.smoke.ts`** - Tests task management
   - CRUD operations
   - Task filtering and sorting
   - Authentication requirements
   - Error scenarios

4. **`category.smoke.ts`** - Tests category management
   - CRUD operations
   - Validation rules
   - Authentication requirements
   - Error handling

5. **`admin.smoke.ts`** - Tests admin-only routes
   - User management
   - Role-based access control
   - Admin privileges
   - Security validation

6. **`runner.smoke.ts`** - Comprehensive test runner
   - Executes all test phases
   - End-to-end workflow testing
   - Performance validation
   - Error handling verification

## Running Smoke Tests

### Individual Tests

```bash
# Test authentication
k6 run smoke/login.smoke.ts

# Test user registration
k6 run smoke/register.smoke.ts

# Test task management
k6 run smoke/task.smoke.ts

# Test category management
k6 run smoke/category.smoke.ts

# Test admin routes
k6 run smoke/admin.smoke.ts
```

### Comprehensive Test Runner

```bash
# Run all tests in sequence
k6 run smoke/runner.smoke.ts
```

### With Custom Configuration

```bash
# Set custom base URL
k6 run -e BASE_URL=http://your-server.com smoke/runner.smoke.ts

# Set custom JWT secret
k6 run -e JWT_SECRET=your-secret smoke/runner.smoke.ts

# Run with custom environment variables
k6 run --env BASE_URL=http://localhost:3000 --env JWT_SECRET=test-secret smoke/runner.smoke.ts
```

## Test Configuration

### Stages
Each smoke test uses a 3-stage approach:
1. **Ramp Up**: Gradually increase to 1 user (30s-1m)
2. **Steady State**: Maintain 1 user for 2 minutes
3. **Ramp Down**: Gradually decrease to 0 users (30s-1m)

### Thresholds
- **Response Time**: 95% of requests should complete within 500ms-1000ms
- **Error Rate**: Less than 10-20% of requests should fail
- **Success Rate**: At least 80% of requests should succeed

### Custom Metrics
- `errors`: Tracks failed checks and assertions
- `success`: Tracks successful operations
- `http_req_duration`: Response time metrics
- `http_req_failed`: HTTP failure rate

## Test Data Management

### JWT Token Generation
The tests include placeholder functions for JWT token generation. You'll need to:

1. **Update the `generateToken()` functions** in each test file
2. **Use real user credentials** or pre-generated tokens
3. **Ensure tokens have appropriate roles** (admin/user)

### Test User Accounts
Create test accounts in your database:
```sql
-- Admin user
INSERT INTO users (fullname, email, password, role, isActive) 
VALUES ('Admin User', 'admin@example.com', 'hashed_password', 'admin', true);

-- Regular user
INSERT INTO users (fullname, email, password, role, isActive) 
VALUES ('Test User', 'user@example.com', 'hashed_password', 'user', true);
```

## Interpreting Results

### Success Indicators
- All checks pass (green checkmarks)
- Response times within thresholds
- Error rates below 20%
- Success rates above 80%

### Common Issues
1. **Authentication Failures**: Check JWT tokens and user credentials
2. **Database Connection**: Verify database is running and accessible
3. **Validation Errors**: Check request payloads and validation rules
4. **Rate Limiting**: Monitor for 429 responses
5. **Network Issues**: Verify server accessibility and firewall settings

### Performance Metrics
- **Response Time**: Should be consistently under 500ms for smoke tests
- **Throughput**: Number of requests per second
- **Error Distribution**: Types and frequency of errors
- **Resource Usage**: CPU, memory, and network utilization

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Smoke Tests
on: [push, pull_request]
jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install K6
        run: |
          curl -L https://github.com/grafana/k6/releases/download/v0.40.0/k6-v0.40.0-linux-amd64.tar.gz | tar xz
          sudo cp k6-v0.40.0-linux-amd64/k6 /usr/local/bin
      - name: Start Backend
        run: |
          cd backend
          npm install
          npm run dev &
          sleep 30
      - name: Run Smoke Tests
        run: |
          k6 run load-tests/smoke/runner.smoke.ts
        env:
          BASE_URL: http://localhost:3000
```

### Docker Integration
```bash
# Run tests in Docker container
docker run -i --rm -v $(pwd):/app -w /app grafana/k6 run smoke/runner.smoke.ts
```

## Troubleshooting

### Common Problems

1. **"Cannot connect to server"**
   - Verify backend is running
   - Check BASE_URL environment variable
   - Ensure no firewall blocking

2. **"JWT token invalid"**
   - Update token generation functions
   - Verify JWT_SECRET matches backend
   - Check token expiration

3. **"Database connection failed"**
   - Ensure database is running
   - Check connection strings
   - Verify database permissions

4. **"Rate limit exceeded"**
   - Reduce test frequency
   - Check rate limiter configuration
   - Monitor server capacity

### Debug Mode
Run tests with verbose output:
```bash
k6 run --verbose smoke/runner.smoke.ts
```

### Log Analysis
K6 generates detailed logs including:
- Request/response details
- Timing information
- Error messages
- Performance metrics

## Next Steps

After smoke tests pass successfully, consider:

1. **Load Tests**: Increase user count and duration
2. **Stress Tests**: Find breaking points
3. **Spike Tests**: Test sudden traffic increases
4. **Soak Tests**: Long-running stability tests
5. **Breakthrough Tests**: Identify performance bottlenecks

## Contributing

When adding new smoke tests:

1. Follow the existing naming convention
2. Include comprehensive error checking
3. Add appropriate thresholds
4. Document test scenarios
5. Update this README

## Support

For issues with:
- **K6**: Check [k6.io documentation](https://k6.io/docs/)
- **Backend**: Review server logs and error messages
- **Tests**: Verify configuration and environment setup
