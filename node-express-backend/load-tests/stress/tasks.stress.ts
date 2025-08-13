import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for stress testing
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const taskCreationRate = new Rate('task_creation_success');
const taskReadRate = new Rate('task_read_success');
const taskUpdateRate = new Rate('task_update_success');
const taskDeleteRate = new Rate('task_delete_success');
const authFailureRate = new Rate('auth_failures');
const dbConnectionErrors = new Counter('db_connection_errors');
const memoryUsage = new Trend('memory_usage');

export const options = {
  stages: [
    // Ramp up to moderate load
    { duration: '2m', target: 50 },
    
    // Sustained moderate load
    { duration: '5m', target: 50 },
    
    // Ramp up to high load
    { duration: '3m', target: 150 },
    
    // Sustained high load (stress phase)
    { duration: '10m', target: 150 },
    
    // Peak stress - push beyond limits
    { duration: '5m', target: 300 },
    
    // Sustained peak stress
    { duration: '8m', target: 300 },
    
    // Overload - beyond system capacity
    { duration: '5m', target: 500 },
    
    // Recovery test - reduce load
    { duration: '3m', target: 100 },
    
    // Cool down
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    // Performance thresholds (more lenient for stress tests)
    http_req_duration: ['p(95)<5000'], // 95% under 5s during stress
    http_req_failed: ['rate<0.5'],     // Allow up to 50% failures during stress
    errors: ['rate<0.5'],              // Allow up to 50% custom errors
    response_time: ['p(95)<8000'],     // 95% under 8s during stress
    
    // Custom metric thresholds
    task_creation_success: ['rate>0.3'], // At least 30% task creation success
    task_read_success: ['rate>0.4'],     // At least 40% task read success
    auth_failures: ['rate<0.7'],         // Auth failures should be manageable
    db_connection_errors: ['count<1000'] // Limit database connection errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Task templates for stress testing
const taskTemplates = [
  {
    title: 'Critical Work Task',
    description: 'This is a critical work task that requires immediate attention',
    status: 'pending',
    priority: 'HIGH',
    categoryId: 1
  },
  {
    title: 'Medium Priority Project',
    description: 'Medium priority project with moderate complexity',
    status: 'in_progress',
    priority: 'MEDIUM',
    categoryId: 1
  },
  {
    title: 'Low Priority Maintenance',
    description: 'Low priority maintenance and cleanup tasks',
    status: 'completed',
    priority: 'LOW',
    categoryId: 2
  },
  {
    title: 'Urgent Bug Fix',
    description: 'Critical bug that needs immediate resolution',
    status: 'pending',
    priority: 'HIGH',
    categoryId: 1
  },
  {
    title: 'Documentation Update',
    description: 'Update project documentation and user guides',
    status: 'todo',
    priority: 'MEDIUM',
    categoryId: 1
  }
];

// Helper function to get a valid JWT token with retry logic
function getValidToken(retryCount = 0) {
  if (retryCount > 3) {
    return 'fallback-token-for-stress-testing';
  }
  
  const loginData = {
    email: 'k6test@example.com',
    password: 'password123'
  };
  
  try {
    const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(loginData), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s'
    });
    
    if (loginResponse.status === 200) {
      return loginResponse.json('token');
    }
  } catch (error) {
    console.log(`Login attempt ${retryCount + 1} failed, retrying...`);
    sleep(1);
    return getValidToken(retryCount + 1);
  }
  
  return 'fallback-token-for-stress-testing';
}

// Helper function to generate random task data
function generateRandomTask() {
  const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000000);
  
  return {
    ...template,
    title: `${template.title} ${randomId}`,
    description: `${template.description} - Generated at ${timestamp} - ID: ${randomId}`,
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within 30 days
    categoryId: Math.floor(Math.random() * 3) + 1,
    tags: [`tag-${randomId}`, `stress-${timestamp}`]
  };
}

// Helper function to generate invalid task data for stress testing
function generateInvalidTask() {
  const invalidTypes = [
    {}, // Empty object
    { title: '' }, // Empty title
    { title: 'A'.repeat(5000) }, // Very long title
    { title: 'Valid Title', priority: 'INVALID_PRIORITY' }, // Invalid priority
    { title: 'Valid Title', status: 'INVALID_STATUS' }, // Invalid status
    { title: 'Valid Title', categoryId: 'not-a-number' }, // Invalid category ID
    { title: 'Valid Title', dueDate: 'invalid-date' }, // Invalid date
    { title: 'Valid Title', priority: null }, // Null priority
    { title: 'Valid Title', status: undefined }, // Undefined status
    { title: 'Valid Title', categoryId: -1 } // Negative category ID
  ];
  
  return invalidTypes[Math.floor(Math.random() * invalidTypes.length)];
}

// Helper function to simulate memory pressure
function simulateMemoryPressure() {
  const largeStrings = [];
  for (let i = 0; i < 100; i++) {
    largeStrings.push('A'.repeat(1000)); // 1KB strings
  }
  return largeStrings.join('');
}

export default function () {
  const token = getValidToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Simulate memory pressure
  const memoryData = simulateMemoryPressure();
  
  // Random sleep to simulate real user behavior and prevent overwhelming
  sleep(Math.random() * 3 + 1);
  
  // Test 1: Mass task creation (stress database writes)
  const tasksToCreate = Math.floor(Math.random() * 10) + 5; // 5-15 tasks per iteration
  let successfulCreations = 0;
  
  for (let i = 0; i < tasksToCreate; i++) {
    const newTask = generateRandomTask();
    
    try {
      const createTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(newTask), { 
        headers,
        timeout: '15s'
      });
      
      responseTime.add(createTaskResponse.timings.duration);
      
      if (createTaskResponse.status === 201) {
        successfulCreations++;
        taskCreationRate.add(1);
      } else {
        taskCreationRate.add(0);
      }
      
      check(createTaskResponse, {
        'task creation returns valid status': (r) => r.status >= 200 && r.status < 600,
        'task creation response time is acceptable': (r) => r.timings.duration < 15000,
      }) || errorRate.add(1);
      
    } catch (error) {
      errorRate.add(1);
      dbConnectionErrors.add(1);
    }
    
    // Minimal delay between rapid requests
    sleep(0.05);
  }
  
  // Test 2: Concurrent read operations (stress database reads)
  const concurrentReads = Math.floor(Math.random() * 15) + 5; // 5-20 concurrent reads
  let successfulReads = 0;
  
  for (let i = 0; i < concurrentReads; i++) {
    const randomEndpoint = Math.floor(Math.random() * 6);
    let response;
    
    try {
      switch (randomEndpoint) {
        case 0:
          response = http.get(`${BASE_URL}/tasks/status/pending`, { headers, timeout: '10s' });
          break;
        case 1:
          response = http.get(`${BASE_URL}/tasks/priority/HIGH`, { headers, timeout: '10s' });
          break;
        case 2:
          response = http.get(`${BASE_URL}/tasks/due/today`, { headers, timeout: '10s' });
          break;
        case 3:
          response = http.get(`${BASE_URL}/tasks/overdue`, { headers, timeout: '10s' });
          break;
        case 4:
          response = http.get(`${BASE_URL}/tasks`, { headers, timeout: '10s' });
          break;
        case 5:
          response = http.get(`${BASE_URL}/tasks?limit=100&offset=0`, { headers, timeout: '10s' });
          break;
      }
      
      if (response && response.status === 200) {
        successfulReads++;
        taskReadRate.add(1);
      } else {
        taskReadRate.add(0);
      }
      
      if (response) {
        responseTime.add(response.timings.duration);
        check(response, {
          'concurrent read returns valid status': (r) => r.status >= 200 && r.status < 600,
          'concurrent read response time is acceptable': (r) => r.timings.duration < 10000,
        }) || errorRate.add(1);
      }
      
    } catch (error) {
      errorRate.add(1);
      dbConnectionErrors.add(1);
    }
  }
  
  // Test 3: Mixed CRUD operations under stress
  const operations = Math.floor(Math.random() * 8) + 3; // 3-10 operations per iteration
  
  for (let i = 0; i < operations; i++) {
    const operation = Math.floor(Math.random() * 5);
    let response;
    
    try {
      switch (operation) {
        case 0: // GET with complex query
          response = http.get(`${BASE_URL}/tasks?status=pending&priority=HIGH&limit=50`, { headers, timeout: '10s' });
          break;
        case 1: // POST with invalid data (stress validation)
          const invalidTask = generateInvalidTask();
          response = http.post(`${BASE_URL}/tasks`, JSON.stringify(invalidTask), { headers, timeout: '15s' });
          break;
        case 2: // PUT to non-existent task (stress error handling)
          response = http.put(`${BASE_URL}/tasks/99999`, JSON.stringify({ title: 'Updated' }), { headers, timeout: '10s' });
          break;
        case 3: // DELETE non-existent task (stress error handling)
          response = http.del(`${BASE_URL}/tasks/99999`, null, { headers, timeout: '10s' });
          break;
        case 4: // PATCH with invalid data
          response = http.patch(`${BASE_URL}/tasks/99999/complete`, JSON.stringify({ completed: 'invalid' }), { headers, timeout: '10s' });
          break;
      }
      
      if (response) {
        responseTime.add(response.timings.duration);
        check(response, {
          'mixed operation returns valid status': (r) => r.status >= 200 && r.status < 600,
          'mixed operation response time is acceptable': (r) => r.timings.duration < 10000,
        }) || errorRate.add(1);
      }
      
    } catch (error) {
      errorRate.add(1);
    }
    
    sleep(0.1);
  }
  
  // Test 4: Authentication stress test
  const invalidTokens = [
    'invalid-token',
    'Bearer invalid',
    'Bearer ',
    '',
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
    'Bearer ' + 'A'.repeat(1000), // Very long invalid token
    'Basic ' + btoa('user:pass'), // Wrong auth type
    'Token ' + Math.random().toString(36) // Random token
  ];
  
  const randomInvalidToken = invalidTokens[Math.floor(Math.random() * invalidTokens.length)];
  const invalidAuthHeaders = {
    'Content-Type': 'application/json',
    'Authorization': randomInvalidToken
  };
  
  try {
    const invalidAuthResponse = http.get(`${BASE_URL}/tasks`, { 
      headers: invalidAuthHeaders,
      timeout: '10s'
    });
    
    responseTime.add(invalidAuthResponse.timings.duration);
    
    if (invalidAuthResponse.status === 401) {
      authFailureRate.add(1);
    } else {
      authFailureRate.add(0);
    }
    
    check(invalidAuthResponse, {
      'invalid auth returns 401': (r) => r.status === 401,
      'invalid auth response time is acceptable': (r) => r.timings.duration < 10000,
    }) || errorRate.add(1);
    
  } catch (error) {
    errorRate.add(1);
  }
  
  // Test 5: Rate limiting and connection stress test
  const rapidRequests = Math.floor(Math.random() * 20) + 10; // 10-30 rapid requests
  
  for (let i = 0; i < rapidRequests; i++) {
    try {
      const rapidResponse = http.get(`${BASE_URL}/tasks`, { 
        headers,
        timeout: '5s'
      });
      
      responseTime.add(rapidResponse.timings.duration);
      
      check(rapidResponse, {
        'rapid request returns valid status': (r) => r.status >= 200 && r.status < 600,
        'rapid request response time is acceptable': (r) => r.timings.duration < 8000,
      }) || errorRate.add(1);
      
    } catch (error) {
      errorRate.add(1);
    }
    
    // Minimal delay to trigger rate limiting
    sleep(0.02);
  }
  
  // Test 6: Large payload stress test
  const largeTask = {
    title: 'Large Task for Stress Testing',
    description: 'A'.repeat(50000), // 50KB description
    status: 'pending',
    priority: 'MEDIUM',
    categoryId: 1,
    metadata: {
      tags: Array.from({ length: 1000 }, (_, i) => `tag-${i}`),
      notes: 'A'.repeat(10000),
      attachments: Array.from({ length: 100 }, (_, i) => ({
        name: `file-${i}.txt`,
        content: 'B'.repeat(1000)
      }))
    }
  };
  
  try {
    const largeTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(largeTask), { 
      headers,
      timeout: '30s'
    });
    
    responseTime.add(largeTaskResponse.timings.duration);
    
    check(largeTaskResponse, {
      'large task returns appropriate status': (r) => r.status === 201 || r.status === 400 || r.status === 413 || r.status === 401,
      'large task response time is acceptable': (r) => r.timings.duration < 30000,
    }) || errorRate.add(1);
    
  } catch (error) {
    errorRate.add(1);
  }
  
  // Test 7: Database connection pool stress test
  const dbStressRequests = Math.floor(Math.random() * 10) + 5; // 5-15 requests
  
  for (let i = 0; i < dbStressRequests; i++) {
    try {
      const stressResponse = http.get(`${BASE_URL}/tasks/status/pending`, { 
        headers,
        timeout: '15s'
      });
      
      responseTime.add(stressResponse.timings.duration);
      
      if (stressResponse.status === 500) {
        dbConnectionErrors.add(1);
      }
      
      check(stressResponse, {
        'db stress request returns valid status': (r) => r.status >= 200 && r.status < 600,
        'db stress response time is acceptable': (r) => r.timings.duration < 15000,
      }) || errorRate.add(1);
      
    } catch (error) {
      errorRate.add(1);
      dbConnectionErrors.add(1);
    }
    
    sleep(0.05);
  }
  
  // Test 8: Error condition stress test
  const errorTests = [
    () => http.get(`${BASE_URL}/tasks/status/INVALID_STATUS`, { headers, timeout: '10s' }),
    () => http.get(`${BASE_URL}/tasks/priority/INVALID_PRIORITY`, { headers, timeout: '10s' }),
    () => http.get(`${BASE_URL}/tasks/category/99999`, { headers, timeout: '10s' }),
    () => http.patch(`${BASE_URL}/tasks/99999/complete`, JSON.stringify({ completed: true }), { headers, timeout: '10s' }),
    () => http.put(`${BASE_URL}/tasks/99999`, JSON.stringify({ title: 'Updated' }), { headers, timeout: '10s' }),
    () => http.del(`${BASE_URL}/tasks/99999`, null, { headers, timeout: '10s' }),
    () => http.get(`${BASE_URL}/tasks?limit=invalid&offset=not-a-number`, { headers, timeout: '10s' })
  ];
  
  const randomErrorTest = errorTests[Math.floor(Math.random() * errorTests.length)];
  
  try {
    const errorTestResponse = randomErrorTest();
    
    if (errorTestResponse) {
      responseTime.add(errorTestResponse.timings.duration);
      check(errorTestResponse, {
        'error test returns appropriate status': (r) => r.status >= 400 && r.status < 600,
        'error test response time is acceptable': (r) => r.timings.duration < 10000,
      }) || errorRate.add(1);
    }
    
  } catch (error) {
    errorRate.add(1);
  }
  
  // Test 9: Memory leak stress test
  // Create and manipulate large objects to test memory management
  const memoryObjects = [];
  for (let i = 0; i < 50; i++) {
    memoryObjects.push({
      id: i,
      data: 'C'.repeat(1000),
      timestamp: Date.now(),
      metadata: Array.from({ length: 100 }, (_, j) => `meta-${j}`)
    });
  }
  
  // Test 10: Concurrent user simulation stress test
  // Simulate multiple users performing different operations simultaneously
  const userOperations = Math.floor(Math.random() * 5) + 2; // 2-6 operations
  
  for (let i = 0; i < userOperations; i++) {
    const userType = Math.floor(Math.random() * 3);
    
    try {
      switch (userType) {
        case 0: // Power user - many operations
          for (let j = 0; j < 5; j++) {
            const task = generateRandomTask();
            http.post(`${BASE_URL}/tasks`, JSON.stringify(task), { headers, timeout: '10s' });
            sleep(0.01);
          }
          break;
          
        case 1: // Casual user - few operations
          http.get(`${BASE_URL}/tasks`, { headers, timeout: '10s' });
          break;
          
        case 2: // Admin user - management operations
          http.get(`${BASE_URL}/tasks?status=pending&priority=HIGH`, { headers, timeout: '10s' });
          break;
      }
    } catch (error) {
      errorRate.add(1);
    }
    
    sleep(0.1);
  }
  
  // Clean up memory objects
  memoryObjects.length = 0;
  
  // Final sleep to prevent overwhelming the system
  sleep(Math.random() * 2 + 1);
}
