import http from 'k6/http';
import { check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics for comprehensive monitoring
const taskDuration = new Trend('task_duration_ms');
const taskSuccessRate = new Rate('task_success_rate');
const taskFailures = new Counter('task_failures');
const responseSizes = new Trend('response_size_bytes');

// Configuration for smoke test (minimal load)
export const options = {
    vus: 1,             // Single virtual user
    iterations: 1,      // Single iteration to avoid rate limiting
    thresholds: {
        'task_success_rate': ['rate>0.5'],     // At least 50% success rate
        'http_req_duration{endpoint:task}': ['p(95)<2000'],  // 95% under 2s
    },
};

// Test user credentials for authentication
const TEST_USER = {
    email: "gideon.ngetich@outlook.com",
    password: "password123"
};

// Test task data
const TEST_TASK = {
    title: "Test Task for Smoke Test",
    description: "This is a test task created during smoke testing",
    status: "pending",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    priority: "MEDIUM",
    categoryId: 1
};

// Global variables to store authentication token and created task ID
let authToken: string = '';
let createdTaskId: string = '';

export default function () {
    group('Task API Smoke Test', () => {
        // Step 1: Authenticate to get token
        const loginRes = authenticateUser();
        if (loginRes.status !== 200) {
            console.log('❌ Authentication failed, skipping task tests');
            return;
        }

        // Step 2: Test task creation
        const createRes = testCreateTask();
        
        // Step 3: Test getting all tasks
        testGetAllTasks();
        
        // Step 4: Test getting specific task
        if (createdTaskId) {
            testGetTaskById(createdTaskId);
        }
        
        // Step 5: Test task update
        if (createdTaskId) {
            testUpdateTask(createdTaskId);
        }
        
        // Step 6: Test task completion toggle
        if (createdTaskId) {
            testToggleTaskCompletion(createdTaskId);
        }
        
        // Step 7: Test filtering endpoints
        testFilterEndpoints();
        
        // Step 8: Test specialized endpoints
        testSpecializedEndpoints();
        
        // Step 9: Clean up - delete the test task
        if (createdTaskId) {
            testDeleteTask(createdTaskId);
        }
    });
}

// Helper function to authenticate user
function authenticateUser() {
    const payload = JSON.stringify(TEST_USER);
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'login' },
        timeout: '5s'
    };

    const res = http.post('http://localhost:3000/login', payload, params);
    
    if (res.status === 200) {
        try {
            const body = JSON.parse(res.body as string);
            authToken = body.token || body.accessToken || '';
            console.log('✅ Authentication successful');
        } catch {
            console.log('❌ Failed to parse authentication response');
        }
    }
    
    return res;
}

// Helper function to test task creation
function testCreateTask() {
    const payload = JSON.stringify(TEST_TASK);
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    const startTime = Date.now();
    const res = http.post('http://localhost:3000/tasks', payload, params);
    const duration = Date.now() - startTime;

    taskDuration.add(duration);
    responseSizes.add(typeof res.body === 'string' ? res.body.length : 0);

    if (res.status === 201) {
        taskSuccessRate.add(true);
        console.log('✅ Task creation successful');
    } else {
        taskFailures.add(1);
        taskSuccessRate.add(false);
        console.log(`❌ Task creation failed: ${res.status} - ${res.body}`);
    }

    return res;
}

// Helper function to test getting all tasks
function testGetAllTasks() {
    const params = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    const res = http.get('http://localhost:3000/tasks', params);
    
    check(res, {
        'GET /tasks returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        },
        'response time < 2s': (r) => r.timings.duration < 2000
    });

    if (res.status === 200) {
        try {
            const tasks = JSON.parse(res.body as string);
            if (tasks.length > 0) {
                // Store the first task ID for further testing
                createdTaskId = tasks[0].id;
                console.log('✅ Get all tasks successful');
            }
        } catch {
            console.log('❌ Failed to parse tasks response');
        }
    }
}

// Helper function to test getting specific task
function testGetTaskById(taskId: string) {
    const params = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    const res = http.get(`http://localhost:3000/tasks/${taskId}`, params);
    
    check(res, {
        'GET /tasks/:id returns 200': (r) => r.status === 200,
        'response contains task object': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return body.id === taskId;
            } catch {
                return false;
            }
        },
        'response time < 2s': (r) => r.timings.duration < 2000
    });

    if (res.status === 200) {
        console.log('✅ Get task by ID successful');
    }
}

// Helper function to test task update
function testUpdateTask(taskId: string) {
    const updateData = {
        title: "Updated Test Task",
        description: "This task has been updated during smoke testing",
        priority: "HIGH"
    };

    const payload = JSON.stringify(updateData);
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    const res = http.put(`http://localhost:3000/tasks/${taskId}`, payload, params);
    
    check(res, {
        'PUT /tasks/:id returns 200': (r) => r.status === 200,
        'response contains success message': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return body.message === "Task updated successfully";
            } catch {
                return false;
            }
        },
        'response time < 2s': (r) => r.timings.duration < 2000
    });

    if (res.status === 200) {
        console.log('✅ Task update successful');
    }
}

// Helper function to test task completion toggle
function testToggleTaskCompletion(taskId: string) {
    const toggleData = {
        completed: true
    };

    const payload = JSON.stringify(toggleData);
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    const res = http.post(`http://localhost:3000/tasks/${taskId}/toggle`, payload, params);
    
    check(res, {
        'POST /tasks/:id/toggle returns 200': (r) => r.status === 200,
        'response contains success message': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return body.message === "Task completion status updated";
            } catch {
                return false;
            }
        },
        'response time < 2s': (r) => r.timings.duration < 2000
    });

    if (res.status === 200) {
        console.log('✅ Task completion toggle successful');
    }
}

// Helper function to test filtering endpoints
function testFilterEndpoints() {
    const params = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    // Test status filter
    const statusRes = http.get('http://localhost:3000/tasks/status/pending', params);
    check(statusRes, {
        'GET /tasks/status/:status returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        }
    });

    // Test priority filter
    const priorityRes = http.get('http://localhost:3000/tasks/priority/MEDIUM', params);
    check(priorityRes, {
        'GET /tasks/priority/:priority returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        }
    });

    // Test category filter
    const categoryRes = http.get('http://localhost:3000/tasks/category/1', params);
    check(categoryRes, {
        'GET /tasks/category/:categoryId returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        }
    });

    console.log('✅ Filter endpoints tested successfully');
}

// Helper function to test specialized endpoints
function testSpecializedEndpoints() {
    const params = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    // Test completed tasks
    const completedRes = http.get('http://localhost:3000/tasks/completed', params);
    check(completedRes, {
        'GET /tasks/completed returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        }
    });

    // Test pending tasks
    const pendingRes = http.get('http://localhost:3000/tasks/pending', params);
    check(pendingRes, {
        'GET /tasks/pending returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        }
    });

    // Test tasks due today
    const dueTodayRes = http.get('http://localhost:3000/tasks/due-today', params);
    check(dueTodayRes, {
        'GET /tasks/due-today returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        }
    });

    // Test overdue tasks
    const overdueRes = http.get('http://localhost:3000/tasks/overdue', params);
    check(overdueRes, {
        'GET /tasks/overdue returns 200': (r) => r.status === 200,
        'response is JSON array': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        }
    });

    console.log('✅ Specialized endpoints tested successfully');
}

// Helper function to test task deletion
function testDeleteTask(taskId: string) {
    const params = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'User-Agent': 'k6-smoke-test/1.0'
        },
        tags: { endpoint: 'task' },
        timeout: '5s'
    };

    const res = http.del(`http://localhost:3000/tasks/${taskId}`, null, params);
    
    check(res, {
        'DELETE /tasks/:id returns 200': (r) => r.status === 200,
        'response contains success message': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return body.message === "Task deleted successfully";
            } catch {
                return false;
            }
        },
        'response time < 2s': (r) => r.timings.duration < 2000
    });

    if (res.status === 200) {
        console.log('✅ Task deletion successful');
    }
}
