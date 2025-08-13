import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 1 }, // Ramp up to 1 user
    { duration: '2m', target: 1 }, // Stay at 1 user for 2 minutes
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],   // Error rate should be less than 10%
    errors: ['rate<0.1'],            // Custom error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Helper function to generate JWT token (you'll need to implement this based on your auth)
function generateToken() {
  // This is a placeholder - you'll need to implement actual JWT generation
  // or use a pre-generated valid token for testing
  return 'your-jwt-token-here';
}

export default function () {
  const token = generateToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Get all tasks (should require authentication)
  const getAllTasksResponse = http.get(`${BASE_URL}/tasks`, { headers });
  
  check(getAllTasksResponse, {
    'get all tasks returns 200': (r) => r.status === 200,
    'response is an array': (r) => Array.isArray(r.json()),
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 2: Create a new task
  const newTask = {
    title: 'Test Task',
    description: 'This is a test task for smoke testing',
    status: 'pending',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    priority: 'MEDIUM',
    categoryId: 1
  };
  
  const createTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(newTask), { headers });
  
  check(createTaskResponse, {
    'create task returns 201': (r) => r.status === 201,
    'response has message': (r) => r.json('message') !== undefined,
    'response has task info': (r) => r.json('task') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Extract task ID for subsequent tests
  let taskId = null;
  if (createTaskResponse.status === 201) {
    taskId = createTaskResponse.json('task.id');
  }
  
  // Test 3: Get task by ID
  if (taskId) {
    const getTaskResponse = http.get(`${BASE_URL}/tasks/${taskId}`, { headers });
    
    check(getTaskResponse, {
      'get task by id returns 200': (r) => r.status === 200,
      'task id matches': (r) => r.json('id') === taskId,
      'task title matches': (r) => r.json('title') === newTask.title,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }
  
  // Test 4: Update task
  if (taskId) {
    const updateData = {
      title: 'Updated Test Task',
      priority: 'HIGH'
    };
    
    const updateTaskResponse = http.put(`${BASE_URL}/tasks/${taskId}`, JSON.stringify(updateData), { headers });
    
    check(updateTaskResponse, {
      'update task returns 200': (r) => r.status === 200,
      'response has success message': (r) => r.json('message') !== undefined,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }
  
  // Test 5: Toggle task completion
  if (taskId) {
    const toggleData = {
      completed: true
    };
    
    const toggleResponse = http.patch(`${BASE_URL}/tasks/${taskId}/complete`, JSON.stringify(toggleData), { headers });
    
    check(toggleResponse, {
      'toggle completion returns 200': (r) => r.status === 200,
      'response has completion status': (r) => r.json('completed') !== undefined,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }
  
  // Test 6: Get tasks by status
  const getTasksByStatusResponse = http.get(`${BASE_URL}/tasks/status/pending`, { headers });
  
  check(getTasksByStatusResponse, {
    'get tasks by status returns 200': (r) => r.status === 200,
    'response is an array': (r) => Array.isArray(r.json()),
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 7: Get tasks by priority
  const getTasksByPriorityResponse = http.get(`${BASE_URL}/tasks/priority/MEDIUM`, { headers });
  
  check(getTasksByPriorityResponse, {
    'get tasks by priority returns 200': (r) => r.status === 200,
    'response is an array': (r) => Array.isArray(r.json()),
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 8: Get tasks due today
  const getTasksDueTodayResponse = http.get(`${BASE_URL}/tasks/due/today`, { headers });
  
  check(getTasksDueTodayResponse, {
    'get tasks due today returns 200': (r) => r.status === 200,
    'response is an array': (r) => Array.isArray(r.json()),
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 9: Get overdue tasks
  const getOverdueTasksResponse = http.get(`${BASE_URL}/tasks/overdue`, { headers });
  
  check(getOverdueTasksResponse, {
    'get overdue tasks returns 200': (r) => r.status === 200,
    'response is an array': (r) => Array.isArray(r.json()),
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 10: Delete task
  if (taskId) {
    const deleteTaskResponse = http.del(`${BASE_URL}/tasks/${taskId}`, null, { headers });
    
    check(deleteTaskResponse, {
      'delete task returns 200': (r) => r.status === 200,
      'response has success message': (r) => r.json('message') !== undefined,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }
  
  // Test 11: Get non-existent task (should return 404)
  const getNonExistentTaskResponse = http.get(`${BASE_URL}/tasks/99999`, { headers });
  
  check(getNonExistentTaskResponse, {
    'get non-existent task returns 404': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 12: Create task with missing required fields
  const invalidTask = {
    description: 'Missing title and other required fields'
  };
  
  const createInvalidTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(invalidTask), { headers });
  
  check(createInvalidTaskResponse, {
    'create invalid task returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 13: Access without authentication (should return 401)
  const noAuthResponse = http.get(`${BASE_URL}/tasks`);
  
  check(noAuthResponse, {
    'access without auth returns 401': (r) => r.status === 401,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 14: Invalid priority value
  const invalidPriorityResponse = http.get(`${BASE_URL}/tasks/priority/INVALID`, { headers });
  
  check(invalidPriorityResponse, {
    'invalid priority returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
}
