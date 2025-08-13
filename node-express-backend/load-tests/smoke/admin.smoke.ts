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

// Helper function to generate admin JWT token (you'll need to implement this based on your auth)
function generateAdminToken() {
  // This is a placeholder - you'll need to implement actual JWT generation
  // or use a pre-generated valid admin token for testing
  return 'your-admin-jwt-token-here';
}

// Helper function to generate regular user JWT token
function generateUserToken() {
  // This is a placeholder - you'll need to implement actual JWT generation
  // or use a pre-generated valid user token for testing
  return 'your-user-jwt-token-here';
}

export default function () {
  const adminToken = generateAdminToken();
  const userToken = generateUserToken();
  
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
  
  const userHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  };
  
  // Test 1: Get all users (admin only)
  const getAllUsersResponse = http.get(`${BASE_URL}/auth/users`, { headers: adminHeaders });
  
  check(getAllUsersResponse, {
    'admin can get all users returns 200': (r) => r.status === 200,
    'response is an array': (r) => Array.isArray(r.json()),
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 2: Regular user cannot access admin routes
  const userAccessResponse = http.get(`${BASE_URL}/auth/users`, { headers: userHeaders });
  
  check(userAccessResponse, {
    'user cannot access admin routes returns 403': (r) => r.status === 403,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 3: Get user by ID (admin only)
  const getUserByIdResponse = http.get(`${BASE_URL}/auth/users/1`, { headers: adminHeaders });
  
  check(getUserByIdResponse, {
    'admin can get user by id returns 200': (r) => r.status === 200,
    'response has user info': (r) => r.json('id') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 4: Get non-existent user (admin only)
  const getNonExistentUserResponse = http.get(`${BASE_URL}/auth/users/99999`, { headers: adminHeaders });
  
  check(getNonExistentUserResponse, {
    'admin gets 404 for non-existent user': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 5: Update user by ID (admin only)
  const updateUserData = {
    fullname: 'Updated User Name',
    email: 'updated@example.com'
  };
  
  const updateUserResponse = http.put(`${BASE_URL}/auth/users/1`, JSON.stringify(updateUserData), { headers: adminHeaders });
  
  check(updateUserResponse, {
    'admin can update user returns 200': (r) => r.status === 200,
    'response has success message': (r) => r.json('message') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 6: Update non-existent user (admin only)
  const updateNonExistentUserResponse = http.put(`${BASE_URL}/auth/users/99999`, JSON.stringify(updateUserData), { headers: adminHeaders });
  
  check(updateNonExistentUserResponse, {
    'admin gets 404 when updating non-existent user': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 7: Deactivate user (admin only)
  const deactivateUserResponse = http.post(`${BASE_URL}/auth/users/1/deactivate`, null, { headers: adminHeaders });
  
  check(deactivateUserResponse, {
    'admin can deactivate user returns 200': (r) => r.status === 200,
    'response has success message': (r) => r.json('message') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 8: Deactivate non-existent user (admin only)
  const deactivateNonExistentUserResponse = http.post(`${BASE_URL}/auth/users/99999/deactivate`, null, { headers: adminHeaders });
  
  check(deactivateNonExistentUserResponse, {
    'admin gets 404 when deactivating non-existent user': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 9: Update user with invalid data (admin only)
  const invalidUpdateData = {
    email: 'invalid-email-format'
  };
  
  const updateUserInvalidResponse = http.put(`${BASE_URL}/auth/users/1`, JSON.stringify(invalidUpdateData), { headers: adminHeaders });
  
  check(updateUserInvalidResponse, {
    'admin gets 400 for invalid update data': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 10: Access admin routes without authentication
  const noAuthResponse = http.get(`${BASE_URL}/auth/users`);
  
  check(noAuthResponse, {
    'access without auth returns 401': (r) => r.status === 401,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 11: Access admin routes with invalid token
  const invalidTokenHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid-token'
  };
  
  const invalidTokenResponse = http.get(`${BASE_URL}/auth/users`, { headers: invalidTokenHeaders });
  
  check(invalidTokenResponse, {
    'access with invalid token returns 401': (r) => r.status === 401,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 12: Test rate limiting (if implemented)
  // Make multiple rapid requests to see if rate limiting kicks in
  for (let i = 0; i < 5; i++) {
    const rapidRequestResponse = http.get(`${BASE_URL}/auth/users`, { headers: adminHeaders });
    
    check(rapidRequestResponse, {
      'rapid request returns valid status': (r) => r.status === 200 || r.status === 429,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);
  }
  
  // Test 13: Test different HTTP methods on admin routes
  const optionsResponse = http.request('OPTIONS', `${BASE_URL}/auth/users`, null, { headers: adminHeaders });
  
  check(optionsResponse, {
    'OPTIONS request on admin route returns valid status': (r) => r.status === 200 || r.status === 405,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 14: Test admin route with query parameters
  const queryParamsResponse = http.get(`${BASE_URL}/auth/users?limit=5`, { headers: adminHeaders });
  
  check(queryParamsResponse, {
    'admin route with query params returns valid status': (r) => r.status === 200 || r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
}
