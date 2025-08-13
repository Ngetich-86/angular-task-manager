import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');

export const options = {
  stages: [
    { duration: '30s', target: 1 },  // Ramp up to 1 user
    { duration: '2m', target: 1 },   // Stay at 1 user for 2 minutes
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1 second
    http_req_failed: ['rate<0.2'],     // Error rate should be less than 20%
    errors: ['rate<0.2'],              // Custom error rate should be less than 20%
    success: ['rate>0.8'],             // Success rate should be greater than 80%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test data
const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  user: {
    email: 'user@example.com',
    password: 'user123'
  }
};

// Store tokens for authenticated requests
let adminToken = '';
let userToken = '';

export default function () {
  console.log('Starting comprehensive smoke test...');
  
  // Phase 1: Authentication Tests
  console.log('Phase 1: Testing authentication endpoints...');
  testAuthentication();
  
  // Phase 2: User Management Tests (Admin only)
  if (adminToken) {
    console.log('Phase 2: Testing admin user management...');
    testAdminUserManagement();
  }
  
  // Phase 3: Category Management Tests
  if (userToken) {
    console.log('Phase 3: Testing category management...');
    testCategoryManagement();
  }
  
  // Phase 4: Task Management Tests
  if (userToken) {
    console.log('Phase 4: Testing task management...');
    testTaskManagement();
  }
  
  // Phase 5: Error Handling Tests
  console.log('Phase 5: Testing error handling...');
  testErrorHandling();
  
  // Phase 6: Performance Tests
  console.log('Phase 6: Testing performance...');
  testPerformance();
  
  console.log('Comprehensive smoke test completed.');
  sleep(2);
}

function testAuthentication() {
  // Test user registration
  const newUser = {
    fullname: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Password123!'
  };
  
  const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify(newUser), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(registerResponse, {
    'user registration successful': (r) => r.status === 201,
    'registration response time < 500ms': (r) => r.timings.duration < 500,
  }) ? successRate.add(1) : errorRate.add(1);
  
  // Test user login
  const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(newUser), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (check(loginResponse, {
    'user login successful': (r) => r.status === 200,
    'login response has token': (r) => r.json('token') !== undefined,
    'login response time < 500ms': (r) => r.timings.duration < 500,
  })) {
    userToken = loginResponse.json('token');
    successRate.add(1);
  } else {
    errorRate.add(1);
  }
  
  // Test admin login (assuming admin exists)
  const adminLoginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(testUsers.admin), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (check(adminLoginResponse, {
    'admin login successful': (r) => r.status === 200,
    'admin login response has token': (r) => r.json('token') !== undefined,
    'admin login response time < 500ms': (r) => r.timings.duration < 500,
  })) {
    adminToken = adminLoginResponse.json('token');
    successRate.add(1);
  } else {
    errorRate.add(1);
  }
}

function testAdminUserManagement() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
  
  // Get all users
  const getAllUsersResponse = http.get(`${BASE_URL}/auth/users`, { headers });
  
  check(getAllUsersResponse, {
    'admin can get all users': (r) => r.status === 200,
    'users response is array': (r) => Array.isArray(r.json()),
    'admin response time < 500ms': (r) => r.timings.duration < 500,
  }) ? successRate.add(1) : errorRate.add(1);
  
  // Get user by ID
  const getUserResponse = http.get(`${BASE_URL}/auth/users/1`, { headers });
  
  check(getUserResponse, {
    'admin can get user by id': (r) => r.status === 200,
    'user response has id': (r) => r.json('id') !== undefined,
    'get user response time < 500ms': (r) => r.timings.duration < 500,
  }) ? successRate.add(1) : errorRate.add(1);
}

function testCategoryManagement() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  };
  
  // Create category
  const newCategory = {
    name: `Test Category ${Date.now()}`,
    description: 'Test category for smoke testing',
    color: '#FF5733'
  };
  
  const createCategoryResponse = http.post(`${BASE_URL}/categories`, JSON.stringify(newCategory), { headers });
  
  if (check(createCategoryResponse, {
    'category creation successful': (r) => r.status === 201,
    'category response has id': (r) => r.json('category.id') !== undefined,
    'create category response time < 500ms': (r) => r.timings.duration < 500,
  })) {
    const categoryId = createCategoryResponse.json('category.id');
    successRate.add(1);
    
    // Get category by ID
    const getCategoryResponse = http.get(`${BASE_URL}/categories/${categoryId}`, { headers });
    
    check(getCategoryResponse, {
      'get category by id successful': (r) => r.status === 200,
      'category id matches': (r) => r.json('id') === categoryId,
      'get category response time < 500ms': (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
    
    // Update category
    const updateData = { name: 'Updated Category Name' };
    const updateCategoryResponse = http.put(`${BASE_URL}/categories/${categoryId}`, JSON.stringify(updateData), { headers });
    
    check(updateCategoryResponse, {
      'category update successful': (r) => r.status === 200,
      'update category response time < 500ms': (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
    
    // Delete category
    const deleteCategoryResponse = http.del(`${BASE_URL}/categories/${categoryId}`, null, { headers });
    
    check(deleteCategoryResponse, {
      'category deletion successful': (r) => r.status === 200,
      'delete category response time < 500ms': (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
  } else {
    errorRate.add(1);
  }
  
  // Get all categories
  const getAllCategoriesResponse = http.get(`${BASE_URL}/categories`, { headers });
  
  check(getAllCategoriesResponse, {
    'get all categories successful': (r) => r.status === 200,
    'categories response is array': (r) => Array.isArray(r.json()),
    'get all categories response time < 500ms': (r) => r.timings.duration < 500,
  }) ? successRate.add(1) : errorRate.add(1);
}

function testTaskManagement() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  };
  
  // Create task
  const newTask = {
    title: `Test Task ${Date.now()}`,
    description: 'Test task for smoke testing',
    status: 'pending',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: 'MEDIUM',
    categoryId: 1
  };
  
  const createTaskResponse = http.post(`${BASE_URL}/tasks`, JSON.stringify(newTask), { headers });
  
  if (check(createTaskResponse, {
    'task creation successful': (r) => r.status === 201,
    'task response has id': (r) => r.json('task.id') !== undefined,
    'create task response time < 500ms': (r) => r.timings.duration < 500,
  })) {
    const taskId = createTaskResponse.json('task.id');
    successRate.add(1);
    
    // Get task by ID
    const getTaskResponse = http.get(`${BASE_URL}/tasks/${taskId}`, { headers });
    
    check(getTaskResponse, {
      'get task by id successful': (r) => r.status === 200,
      'task id matches': (r) => r.json('id') === taskId,
      'get task response time < 500ms': (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
    
    // Update task
    const updateData = { title: 'Updated Task Title', priority: 'HIGH' };
    const updateTaskResponse = http.put(`${BASE_URL}/tasks/${taskId}`, JSON.stringify(updateData), { headers });
    
    check(updateTaskResponse, {
      'task update successful': (r) => r.status === 200,
      'update task response time < 500ms': (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
    
    // Toggle completion
    const toggleData = { completed: true };
    const toggleResponse = http.patch(`${BASE_URL}/tasks/${taskId}/complete`, JSON.stringify(toggleData), { headers });
    
    check(toggleResponse, {
      'task completion toggle successful': (r) => r.status === 200,
      'toggle response time < 500ms': (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
    
    // Delete task
    const deleteTaskResponse = http.del(`${BASE_URL}/tasks/${taskId}`, null, { headers });
    
    check(deleteTaskResponse, {
      'task deletion successful': (r) => r.status === 200,
      'delete task response time < 500ms': (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
  } else {
    errorRate.add(1);
  }
  
  // Test various task endpoints
  const endpoints = [
    '/tasks',
    '/tasks/status/pending',
    '/tasks/priority/MEDIUM',
    '/tasks/due/today',
    '/tasks/overdue'
  ];
  
  endpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`, { headers });
    
    check(response, {
      `${endpoint} returns 200`: (r) => r.status === 200,
      `${endpoint} response time < 500ms`: (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
  });
}

function testErrorHandling() {
  // Test invalid endpoints
  const invalidEndpoints = [
    '/invalid-endpoint',
    '/auth/invalid',
    '/tasks/invalid',
    '/categories/invalid'
  ];
  
  invalidEndpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);
    
    check(response, {
      `${endpoint} returns 404`: (r) => r.status === 404,
      `${endpoint} response time < 500ms`: (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
  });
  
  // Test authentication errors
  const protectedEndpoints = ['/tasks', '/categories', '/auth/users'];
  
  protectedEndpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);
    
    check(response, {
      `${endpoint} without auth returns 401`: (r) => r.status === 401,
      `${endpoint} response time < 500ms`: (r) => r.timings.duration < 500,
    }) ? successRate.add(1) : errorRate.add(1);
  });
}

function testPerformance() {
  // Test concurrent requests
  const endpoints = ['/auth/login', '/tasks', '/categories'];
  
  endpoints.forEach(endpoint => {
    const startTime = Date.now();
    const response = http.get(`${BASE_URL}${endpoint}`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    check(response, {
      `${endpoint} response time < 1000ms`: (r) => responseTime < 1000,
    }) ? successRate.add(1) : errorRate.add(1);
  });
  
  // Test database connection endpoint
  const dbTestResponse = http.get(`${BASE_URL}/test-db`);
  
  check(dbTestResponse, {
    'database connection test successful': (r) => r.status === 200,
    'db test response time < 1000ms': (r) => r.timings.duration < 1000,
  }) ? successRate.add(1) : errorRate.add(1);
}
