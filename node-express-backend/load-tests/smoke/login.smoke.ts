import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 1 }, // Ramp up to 1 user
    { duration: '20s', target: 1 }, // Stay at 1 user for 20 seconds
    { duration: '40s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests should be below 800ms
    http_req_failed: ['rate<0.2'],   // Error rate should be less than 20%
    errors: ['rate<0.2'],            // Custom error rate should be less than 20%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const url = `${BASE_URL}/auth/login`;
  
  // Test 1: Successful login with valid credentials
  const validCredentials = {
    email: 'k6test@example.com',
    password: 'password123'
  };
  
  const loginResponse = http.post(url, JSON.stringify(validCredentials), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(loginResponse, {
    'login successful returns 200': (r) => r.status === 200,
    'login response has token': (r) => r.json('token') !== undefined,
    'login response has user info': (r) => r.json('user') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 2: Login with invalid password
  const invalidPassword = {
    email: 'k6test@example.com',
    password: 'wrongpassword'
  };
  
  const invalidPasswordResponse = http.post(url, JSON.stringify(invalidPassword), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(invalidPasswordResponse, {
    'invalid password returns 401': (r) => r.status === 401,
    'error message is present': (r) => r.json('message') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 3: Login with non-existent user
  const nonExistentUser = {
    email: 'nonexistent@example.com',
    password: 'password123'
  };
  
  const nonExistentResponse = http.post(url, JSON.stringify(nonExistentUser), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(nonExistentResponse, {
    'non-existent user returns 404': (r) => r.status === 404,
    'error message is present': (r) => r.json('message') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 4: Login with missing email
  const missingEmail = {
    password: 'password123'
  };
  
  const missingEmailResponse = http.post(url, JSON.stringify(missingEmail), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(missingEmailResponse, {
    'missing email returns 404': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 5: Login with missing password
  const missingPassword = {
    email: 'k6test@example.com'
  };
  
  const missingPasswordResponse = http.post(url, JSON.stringify(missingPassword), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(missingPasswordResponse, {
    'missing password returns 500': (r) => r.status === 500,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 6: Login with empty body
  const emptyBodyResponse = http.post(url, '', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(emptyBodyResponse, {
    'empty body returns 500': (r) => r.status === 500,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
}
