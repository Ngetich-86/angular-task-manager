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

export default function () {
  const url = `${BASE_URL}/auth/register`;
  
  // Test 1: Successful user registration
  const validUser = {
    fullname: 'John Doe',
    email: `test${Date.now()}@example.com`, // Unique email to avoid conflicts
    password: 'Password123!'
  };
  
  const registerResponse = http.post(url, JSON.stringify(validUser), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(registerResponse, {
    'registration successful returns 201': (r) => r.status === 201,
    'registration response has message': (r) => r.json('message') !== undefined,
    'registration response has user info': (r) => r.json('user') !== undefined,
    'user id is present': (r) => r.json('user.id') !== undefined,
    'user email matches': (r) => r.json('user.email') === validUser.email,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 2: Registration with duplicate email (should fail)
  const duplicateUser = {
    fullname: 'Jane Doe',
    email: 'existing@example.com', // This should already exist
    password: 'Password123!'
  };
  
  const duplicateResponse = http.post(url, JSON.stringify(duplicateUser), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(duplicateResponse, {
    'duplicate email returns 400': (r) => r.status === 400,
    'error message about existing user': (r) => r.json('message') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 3: Registration with missing fullname
  const missingFullname = {
    email: 'test@example.com',
    password: 'Password123!'
  };
  
  const missingFullnameResponse = http.post(url, JSON.stringify(missingFullname), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(missingFullnameResponse, {
    'missing fullname returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 4: Registration with missing email
  const missingEmail = {
    fullname: 'John Doe',
    password: 'Password123!'
  };
  
  const missingEmailResponse = http.post(url, JSON.stringify(missingEmail), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(missingEmailResponse, {
    'missing email returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 5: Registration with missing password
  const missingPassword = {
    fullname: 'John Doe',
    email: 'test@example.com'
  };
  
  const missingPasswordResponse = http.post(url, JSON.stringify(missingPassword), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(missingPasswordResponse, {
    'missing password returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 6: Registration with invalid email format
  const invalidEmail = {
    fullname: 'John Doe',
    email: 'invalid-email',
    password: 'Password123!'
  };
  
  const invalidEmailResponse = http.post(url, JSON.stringify(invalidEmail), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(invalidEmailResponse, {
    'invalid email format returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 7: Registration with weak password
  const weakPassword = {
    fullname: 'John Doe',
    email: 'test@example.com',
    password: '123' // Too short
  };
  
  const weakPasswordResponse = http.post(url, JSON.stringify(weakPassword), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(weakPasswordResponse, {
    'weak password returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 8: Registration with empty body
  const emptyBodyResponse = http.post(url, '', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(emptyBodyResponse, {
    'empty body returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
}
