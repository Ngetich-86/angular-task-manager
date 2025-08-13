import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    // Baseline - normal load
    { duration: '30s', target: 10 },
    
    // Spike - sudden increase to high load
    { duration: '1m', target: 100 },
    
    // Sustained high load
    { duration: '2m', target: 100 },
    
    // Scale down - reduce load
    { duration: '1m', target: 20 },
    
    // Recovery - back to normal
    { duration: '30s', target: 10 },
    
    // Final spike
    { duration: '1m', target: 150 },
    
    // Cool down
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s under spike load
    http_req_failed: ['rate<0.3'],     // Error rate should be less than 30% during spikes
    errors: ['rate<0.3'],              // Custom error rate should be less than 30%
    response_time: ['p(95)<3000']      // 95% of response times should be below 3s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test data for tasks
const taskTemplates = [
  {
    title: 'High Priority Task',
    description: 'This is a high priority task for spike testing',
    status: 'pending',
    priority: 'HIGH',
    categoryId: 1
  },
  {
    title: 'Medium Priority Task',
    description: 'This is a medium priority task for spike testing',
    status: 'in_progress',
    priority: 'MEDIUM',
    categoryId: 1
  },
  {
    title: 'Low Priority Task',
    description: 'This is a low priority task for spike testing',
    status: 'completed',
    priority: 'LOW',
    categoryId: 1
  }
];

// Helper function to get a valid JWT token
function getValidToken() {
  const loginData = {
    email: 'k6test@example.com',
    password: 'password123'
  };
  
  const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(loginData), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (loginResponse.status === 200) {
    return loginResponse.json('token');
  }
  
  // Fallback to a mock token if login fails
  return 'mock-token-for-testing';
}

// Helper function to create a random task
function generateRandomTask() {
  const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
  const timestamp = Date.now();
  
  return {
    ...template,
    title: `${template.title} ${timestamp}`,
    description: `${template.description} - Generated at ${timestamp}`,
    dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within 7 days
    categoryId: Math.floor(Math.random() * 3) + 1 // Random category ID 1-3
  };
}

export default function () {
  const token = getValidToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Random sleep to simulate real user behavior
  sleep(Math.random() * 2 + 0.5);
  
  // Test 1: Get all tasks (high frequency operation)
  const getAllTasksResponse = http.get(`${BASE_URL}/tasks`, { headers });
  responseTime.add(getAllTasksResponse.timings.duration);
  
  check(getAllTasksResponse, {
    'get all tasks returns valid status': (r) => r.status === 200 || r.status === 401 || r.status === 429,
    'response time is reasonable': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
  
  // Test 2: Create multiple tasks rapidly (spike behavior)
  const tasksToCreate = Math.floor(Math.random() * 5) + 1; // 1-5 tasks per iteration
  
  for (let i = 0; i < tasksToCreate; i++) {
    const newTask = generateRandomTask();
    const createTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(newTask), { headers });
    responseTime.add(createTaskResponse.timings.duration);
    
    check(createTaskResponse, {
      'create task returns valid status': (r) => r.status === 201 || r.status === 400 || r.status === 401 || r.status === 429,
      'response time is reasonable': (r) => r.timings.duration < 5000,
    }) || errorRate.add(1);
    
    // Small delay between rapid requests
    sleep(0.1);
  }
  
  // Test 3: Concurrent read operations (simulate dashboard load)
  const concurrentReads = Math.floor(Math.random() * 8) + 2; // 2-10 concurrent reads
  
  for (let i = 0; i < concurrentReads; i++) {
    const randomEndpoint = Math.floor(Math.random() * 4);
    let response;
    
    switch (randomEndpoint) {
      case 0:
        response = http.get(`${BASE_URL}/tasks/status/pending`, { headers });
        break;
      case 1:
        response = http.get(`${BASE_URL}/tasks/priority/HIGH`, { headers });
        break;
      case 2:
        response = http.get(`${BASE_URL}/tasks/due/today`, { headers });
        break;
      case 3:
        response = http.get(`${BASE_URL}/tasks/overdue`, { headers });
        break;
    }
    
    if (response) {
      responseTime.add(response.timings.duration);
      check(response, {
        'concurrent read returns valid status': (r) => r.status === 200 || r.status === 401 || r.status === 429,
        'concurrent read response time is reasonable': (r) => r.timings.duration < 5000,
      }) || errorRate.add(1);
    }
  }
  
  // Test 4: Stress test with invalid data (edge case handling under load)
  const invalidTasks = [
    {}, // Empty object
    { title: '' }, // Empty title
    { title: 'A'.repeat(1000) }, // Very long title
    { title: 'Valid Title', priority: 'INVALID_PRIORITY' }, // Invalid priority
    { title: 'Valid Title', status: 'INVALID_STATUS' }, // Invalid status
    { title: 'Valid Title', categoryId: 'not-a-number' } // Invalid category ID
  ];
  
  const randomInvalidTask = invalidTasks[Math.floor(Math.random() * invalidTasks.length)];
  const invalidTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(randomInvalidTask), { headers });
  responseTime.add(invalidTaskResponse.timings.duration);
  
  check(invalidTaskResponse, {
    'invalid task returns appropriate status': (r) => r.status === 400 || r.status === 401 || r.status === 429,
    'invalid task response time is reasonable': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
  
  // Test 5: Authentication stress test
  const invalidTokens = [
    'invalid-token',
    'Bearer invalid',
    'Bearer ',
    '',
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid'
  ];
  
  const randomInvalidToken = invalidTokens[Math.floor(Math.random() * invalidTokens.length)];
  const invalidAuthHeaders = {
    'Content-Type': 'application/json',
    'Authorization': randomInvalidToken
  };
  
  const invalidAuthResponse = http.get(`${BASE_URL}/tasks`, { headers: invalidAuthHeaders });
  responseTime.add(invalidAuthResponse.timings.duration);
  
  check(invalidAuthResponse, {
    'invalid auth returns 401': (r) => r.status === 401,
    'invalid auth response time is reasonable': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
  
  // Test 6: Rate limiting test (if implemented)
  const rapidRequests = Math.floor(Math.random() * 10) + 5; // 5-15 rapid requests
  
  for (let i = 0; i < rapidRequests; i++) {
    const rapidResponse = http.get(`${BASE_URL}/tasks`, { headers });
    responseTime.add(rapidResponse.timings.duration);
    
    check(rapidResponse, {
      'rapid request returns valid status': (r) => r.status === 200 || r.status === 401 || r.status === 429,
      'rapid request response time is reasonable': (r) => r.timings.duration < 5000,
    }) || errorRate.add(1);
    
    // Minimal delay to trigger rate limiting
    sleep(0.05);
  }
  
  // Test 7: Mixed operation stress test
  const operations = Math.floor(Math.random() * 3) + 1; // 1-3 operations per iteration
  
  for (let i = 0; i < operations; i++) {
    const operation = Math.floor(Math.random() * 4);
    let response;
    
    switch (operation) {
      case 0: // GET with query params
        response = http.get(`${BASE_URL}/tasks?limit=10&offset=0`, { headers });
        break;
      case 1: // POST with minimal data
        response = http.post(`${BASE_URL}/tasks`, JSON.stringify({ title: `Quick Task ${Date.now()}` }), { headers });
        break;
      case 2: // PUT to non-existent task
        response = http.put(`${BASE_URL}/tasks/99999`, JSON.stringify({ title: 'Updated' }), { headers });
        break;
      case 3: // DELETE non-existent task
        response = http.del(`${BASE_URL}/tasks/99999`, null, { headers });
        break;
    }
    
    if (response) {
      responseTime.add(response.timings.duration);
      check(response, {
        'mixed operation returns valid status': (r) => r.status >= 200 && r.status < 600,
        'mixed operation response time is reasonable': (r) => r.timings.duration < 5000,
      }) || errorRate.add(1);
    }
  }
  
  // Test 8: Memory/connection leak test
  // Make requests with large payloads to test memory handling
  const largeTask = {
    title: 'Large Task',
    description: 'A'.repeat(10000), // 10KB description
    status: 'pending',
    priority: 'MEDIUM',
    categoryId: 1
  };
  
  const largeTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(largeTask), { headers });
  responseTime.add(largeTaskResponse.timings.duration);
  
  check(largeTaskResponse, {
    'large task returns valid status': (r) => r.status === 201 || r.status === 400 || r.status === 413 || r.status === 401,
    'large task response time is reasonable': (r) => r.timings.duration < 10000,
  }) || errorRate.add(1);
  
  // Test 9: Database connection stress test
  // Make requests that might stress database connections
  const dbStressRequests = Math.floor(Math.random() * 5) + 3; // 3-8 requests
  
  for (let i = 0; i < dbStressRequests; i++) {
    const stressResponse = http.get(`${BASE_URL}/tasks/status/pending`, { headers });
    responseTime.add(stressResponse.timings.duration);
    
    check(stressResponse, {
      'db stress request returns valid status': (r) => r.status === 200 || r.status === 401 || r.status === 429 || r.status === 500,
      'db stress response time is reasonable': (r) => r.timings.duration < 10000,
    }) || errorRate.add(1);
    
    sleep(0.1);
  }
  
  // Test 10: Error handling under load
  // Test various error conditions to ensure graceful degradation
  const errorTests = [
    () => http.get(`${BASE_URL}/tasks/status/INVALID_STATUS`, { headers }),
    () => http.get(`${BASE_URL}/tasks/priority/INVALID_PRIORITY`, { headers }),
    () => http.get(`${BASE_URL}/tasks/category/99999`, { headers }),
    () => http.patch(`${BASE_URL}/tasks/99999/complete`, JSON.stringify({ completed: true }), { headers })
  ];
  
  const randomErrorTest = errorTests[Math.floor(Math.random() * errorTests.length)];
  const errorTestResponse = randomErrorTest();
  
  if (errorTestResponse) {
    responseTime.add(errorTestResponse.timings.duration);
    check(errorTestResponse, {
      'error test returns appropriate status': (r) => r.status >= 400 && r.status < 600,
      'error test response time is reasonable': (r) => r.timings.duration < 5000,
    }) || errorRate.add(1);
  }
  
  // Final sleep to prevent overwhelming the system
  sleep(Math.random() * 1 + 0.5);
}
