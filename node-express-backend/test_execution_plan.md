# K6 Load Testing Suite - Test Execution Plan

## Overview
This document outlines the comprehensive testing strategy for your Node.js Express backend using Grafana K6. The testing suite includes smoke tests, spike tests, and stress tests to ensure your system's reliability, performance, and scalability.

## Test Types and Purposes

### 1. Smoke Tests (Basic Functionality)
**Purpose**: Verify that basic functionality works under normal conditions
**Duration**: ~1-2 minutes per test
**Load**: 1 user
**Focus**: API correctness, basic performance, error handling

**Files**:
- `load-tests/smoke/login.smoke.ts` - Authentication testing
- `load-tests/smoke/register.smoke.ts` - User registration testing
- `load-tests/smoke/task.smoke.ts` - Task management testing
- `load-tests/smoke/category.smoke.ts` - Category management testing
- `load-tests/smoke/admin.smoke.ts` - Admin functionality testing
- `load-tests/smoke/runner.smoke.ts` - Comprehensive smoke test runner

### 2. Spike Tests (Sudden Load Increases)
**Purpose**: Test system behavior under sudden load spikes
**Duration**: ~7 minutes total
**Load**: 10 → 100 → 150 users (sudden increases)
**Focus**: System resilience, recovery patterns, breaking points

**Files**:
- `load-tests/spike/task.spike.ts` - Task operations under spike load

### 3. Stress Tests (Extended High Load)
**Purpose**: Push system to its limits and beyond
**Duration**: ~43 minutes total
**Load**: 50 → 150 → 300 → 500 users (gradual increase)
**Focus**: System capacity, performance degradation, recovery

**Files**:
- `load-tests/stress/tasks.stress.ts` - Task operations under extreme stress

## Test Execution Order

### Phase 1: Environment Setup and Validation
1. **Prerequisites Check**
   - Ensure backend server is running on port 5000
   - Verify database connectivity
   - Confirm test user exists (`k6test@example.com`)

2. **Database Health Check**
   ```bash
   curl http://localhost:5000/test-db
   ```

### Phase 2: Smoke Testing (Foundation)
**Execution Order**:
1. **Individual Smoke Tests** (run these first to validate basic functionality)
   ```bash
   # Test authentication
   k6 run load-tests/smoke/login.smoke.ts
   
   # Test registration
   k6 run load-tests/smoke/register.smoke.ts
   
   # Test task management
   k6 run load-tests/smoke/task.smoke.ts
   
   # Test category management
   k6 run load-tests/smoke/category.smoke.ts
   
   # Test admin functionality
   k6 run load-tests/smoke/admin.smoke.ts
   ```

2. **Comprehensive Smoke Test Runner**
   ```bash
   # Run all smoke tests together
   k6 run load-tests/smoke/runner.smoke.ts
   ```

**Expected Results**:
- All tests pass with >80% success rate
- Response times < 800ms for 95% of requests
- Error rate < 20%

### Phase 3: Spike Testing (Load Variability)
**Execution Order**:
1. **Task Spike Test**
   ```bash
   k6 run load-tests/spike/task.spike.ts
   ```

**Expected Results**:
- System handles sudden load increases gracefully
- Response times < 2s during spikes
- Error rate < 30% during spikes
- System recovers when load decreases

### Phase 4: Stress Testing (System Limits)
**Execution Order**:
1. **Task Stress Test**
   ```bash
   k6 run load-tests/stress/tasks.stress.ts
   ```

**Expected Results**:
- System maintains stability under sustained high load
- Response times < 5s during stress
- Error rate < 50% during stress
- System recovers after stress period

## Test Execution Commands

### Quick Start Commands
```bash
# Run all smoke tests
pnpm smoke:login && pnpm smoke:register && pnpm smoke:task && pnpm smoke:category && pnpm smoke:admin

# Run spike test
pnpm spike:task

# Run stress test
pnpm stress:task
```

### Manual Execution Commands
```bash
# Smoke Tests
k6 run load-tests/smoke/login.smoke.ts
k6 run load-tests/smoke/register.smoke.ts
k6 run load-tests/smoke/task.smoke.ts
k6 run load-tests/smoke/category.smoke.ts
k6 run load-tests/smoke/admin.smoke.ts
k6 run load-tests/smoke/runner.smoke.ts

# Spike Tests
k6 run load-tests/spike/task.spike.ts

# Stress Tests
k6 run load-tests/stress/tasks.stress.ts
```

## Monitoring and Metrics

### Key Metrics to Monitor
1. **Response Time**: p95, p99 percentiles
2. **Error Rate**: HTTP failures, custom errors
3. **Throughput**: Requests per second
4. **Resource Usage**: CPU, memory, database connections

### Monitoring Tools
- **K6 Built-in Metrics**: Response times, error rates, throughput
- **System Monitoring**: CPU, memory, network usage
- **Database Monitoring**: Connection pool usage, query performance
- **Application Logs**: Error messages, performance issues

## Test Data Management

### Test Users
- **Regular User**: `k6test@example.com` / `password123`
- **Admin User**: Create as needed for admin tests

### Test Data Cleanup
- Tasks and categories created during testing may persist
- Consider database cleanup between test runs for consistent results

## Success Criteria

### Smoke Tests
- ✅ All API endpoints respond correctly
- ✅ Authentication works properly
- ✅ Basic CRUD operations succeed
- ✅ Response times < 800ms (95th percentile)
- ✅ Error rate < 20%

### Spike Tests
- ✅ System handles sudden load increases
- ✅ Response times < 2s during spikes
- ✅ Error rate < 30% during spikes
- ✅ System recovers when load decreases

### Stress Tests
- ✅ System maintains stability under sustained load
- ✅ Response times < 5s during stress
- ✅ Error rate < 50% during stress
- ✅ System recovers after stress period
- ✅ No memory leaks or crashes

## Troubleshooting

### Common Issues
1. **Connection Refused**: Ensure backend server is running on port 5000
2. **Authentication Failures**: Verify test user exists and credentials are correct
3. **Database Errors**: Check database connectivity and connection pool settings
4. **High Error Rates**: Review backend logs for specific error messages

### Debug Steps
1. Check backend server status
2. Verify database connectivity
3. Review application logs
4. Check system resource usage
5. Validate test data and credentials

## Reporting and Documentation

### Test Results
- Save K6 output logs for each test run
- Document any failures or performance issues
- Track metrics over time for trend analysis

### Recommendations
- Document breaking points and system limits
- Identify areas for optimization
- Plan capacity improvements based on results

## Next Steps

After completing the test suite:
1. **Analyze Results**: Review all test outputs and identify patterns
2. **Optimize System**: Address any performance bottlenecks
3. **Update Tests**: Modify tests based on findings
4. **Automate**: Integrate tests into CI/CD pipeline
5. **Monitor**: Set up ongoing performance monitoring

---

**Note**: This testing suite is designed to be comprehensive and may take several hours to complete. Run tests during off-peak hours and ensure you have proper monitoring in place.
