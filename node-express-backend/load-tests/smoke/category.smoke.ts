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
  
  // Test 1: Get all categories (should require authentication)
  const getAllCategoriesResponse = http.get(`${BASE_URL}/categories`, { headers });
  
  check(getAllCategoriesResponse, {
    'get all categories returns 200': (r) => r.status === 200,
    'response is an array': (r) => Array.isArray(r.json()),
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 2: Create a new category
  const newCategory = {
    name: `Test Category ${Date.now()}`,
    description: 'This is a test category for smoke testing',
    color: '#FF5733'
  };
  
  const createCategoryResponse = http.post(`${BASE_URL}/categories`, JSON.stringify(newCategory), { headers });
  
  check(createCategoryResponse, {
    'create category returns 201': (r) => r.status === 201,
    'response has message': (r) => r.json('message') !== undefined,
    'response has category info': (r) => r.json('category') !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Extract category ID for subsequent tests
  let categoryId = null;
  if (createCategoryResponse.status === 201) {
    categoryId = createCategoryResponse.json('category.id');
  }
  
  // Test 3: Get category by ID
  if (categoryId) {
    const getCategoryResponse = http.get(`${BASE_URL}/categories/${categoryId}`, { headers });
    
    check(getCategoryResponse, {
      'get category by id returns 200': (r) => r.status === 200,
      'category id matches': (r) => r.json('id') === categoryId,
      'category name matches': (r) => r.json('name') === newCategory.name,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }
  
  // Test 4: Update category
  if (categoryId) {
    const updateData = {
      name: 'Updated Test Category',
      color: '#33FF57'
    };
    
    const updateCategoryResponse = http.put(`${BASE_URL}/categories/${categoryId}`, JSON.stringify(updateData), { headers });
    
    check(updateCategoryResponse, {
      'update category returns 200': (r) => r.status === 200,
      'response has success message': (r) => r.json('message') !== undefined,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }
  
  // Test 5: Delete category
  if (categoryId) {
    const deleteCategoryResponse = http.del(`${BASE_URL}/categories/${categoryId}`, null, { headers });
    
    check(deleteCategoryResponse, {
      'delete category returns 200': (r) => r.status === 200,
      'response has success message': (r) => r.json('message') !== undefined,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }
  
  // Test 6: Get non-existent category (should return 404)
  const getNonExistentCategoryResponse = http.get(`${BASE_URL}/categories/99999`, { headers });
  
  check(getNonExistentCategoryResponse, {
    'get non-existent category returns 404': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 7: Create category with missing required fields
  const invalidCategory = {
    description: 'Missing name field'
  };
  
  const createInvalidCategoryResponse = http.post(`${BASE_URL}/categories`, JSON.stringify(invalidCategory), { headers });
  
  check(createInvalidCategoryResponse, {
    'create invalid category returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 8: Create category with invalid color format
  const invalidColorCategory = {
    name: 'Invalid Color Category',
    description: 'Category with invalid color format',
    color: 'invalid-color'
  };
  
  const createInvalidColorResponse = http.post(`${BASE_URL}/categories`, JSON.stringify(invalidColorCategory), { headers });
  
  check(createInvalidColorResponse, {
    'create category with invalid color returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 9: Access without authentication (should return 401)
  const noAuthResponse = http.get(`${BASE_URL}/categories`);
  
  check(noAuthResponse, {
    'access without auth returns 401': (r) => r.status === 401,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 10: Create category with empty name
  const emptyNameCategory = {
    name: '',
    description: 'Category with empty name',
    color: '#FF5733'
  };
  
  const createEmptyNameResponse = http.post(`${BASE_URL}/categories`, JSON.stringify(emptyNameCategory), { headers });
  
  check(createEmptyNameResponse, {
    'create category with empty name returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 11: Create category with very long name
  const longNameCategory = {
    name: 'A'.repeat(100), // Very long name
    description: 'Category with very long name',
    color: '#FF5733'
  };
  
  const createLongNameResponse = http.post(`${BASE_URL}/categories`, JSON.stringify(longNameCategory), { headers });
  
  check(createLongNameResponse, {
    'create category with long name returns 400': (r) => r.status === 400,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 12: Update non-existent category
  const updateNonExistentResponse = http.put(`${BASE_URL}/categories/99999`, JSON.stringify({ name: 'Updated' }), { headers });
  
  check(updateNonExistentResponse, {
    'update non-existent category returns 404': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test 13: Delete non-existent category
  const deleteNonExistentResponse = http.del(`${BASE_URL}/categories/99999`, null, { headers });
  
  check(deleteNonExistentResponse, {
    'delete non-existent category returns 404': (r) => r.status === 404,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
}
