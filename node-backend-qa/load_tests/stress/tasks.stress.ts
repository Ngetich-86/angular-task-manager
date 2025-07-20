import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const taskCreationDuration = new Trend('task_creation_duration');
const taskListDuration = new Trend('task_list_duration');
const taskUpdateDuration = new Trend('task_update_duration');
const taskDeletionDuration = new Trend('task_deletion_duration');
const successRate = new Rate('success_rate');
const failures = new Counter('failures');

// Configurable via environment variables
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'gideon.ngetich@outlook.com';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'password123';
const CATEGORY_ID = __ENV.CATEGORY_ID || 1;

export const options = {
    stages: [
        { duration: '30s', target: 5 },   // Ramp up to 50 users
        // { duration: '3m', target: 100 },  // Increase to 100 users
        // { duration: '2m', target: 200 },  // Spike to 200 users
        // { duration: '1m', target: 50 },   // Scale down
    ],
    thresholds: {
        'http_req_duration{type:create}': ['p(95)<800'],
        'http_req_duration{type:list}': ['p(95)<500'],
        'http_req_failed': ['rate<0.05'],
        'success_rate': ['rate>0.95'],
    },
};

// Authenticate once in setup and share token
export function setup() {
    const payload = JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
    const params = {
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'k6-stress-test/1.0' },
        tags: { endpoint: 'login' },
        timeout: '5s',
    };
    const res = http.post(`${BASE_URL}/login`, payload, params);
    if (res.status !== 200) {
        fail(`Authentication failed: ${res.status} - ${res.body}`);
    }
    const body = typeof res.body === 'string' ? JSON.parse(res.body) : {};
    return { authToken: body.token || body.accessToken };
}

export default function (data) {
    const authToken = data.authToken;
    let createdTaskId = null;

    group('Task Stress Test', () => {
        // 1. Create Task
        group('Create Task', () => {
            const taskPayload = JSON.stringify({
                title: `Stress Task ${__VU}-${__ITER}`,
                description: 'Created during stress test',
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'MEDIUM',
                categoryId: Number(CATEGORY_ID),
            });
            const params = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'User-Agent': 'k6-stress-test/1.0',
                },
                tags: { type: 'create' },
                timeout: '5s',
            };
            const start = Date.now();
            const res = http.post(`${BASE_URL}/tasks`, taskPayload, params);
            console.log('Create task response:', res.status, res.body); // <-- Debug log
            taskCreationDuration.add(Date.now() - start);
            const ok = check(res, {
                'create task status 201': (r) => r.status === 201,
                'create task has message': (r) => {
                    const body = typeof r.body === 'string' ? JSON.parse(r.body) : {};
                    return body.message === 'Task created successfully';
                },
            });
            successRate.add(ok);
            if (!ok) {
                failures.add(1);
                fail(`Task creation failed: ${res.status} - ${res.body}`);
            }
            // Get the created task ID from the list endpoint
            sleep(0.5);
        });

        // 2. List Tasks
        group('List Tasks', () => {
            const params = {
                headers: { 'Authorization': `Bearer ${authToken}` },
                tags: { type: 'list' },
                timeout: '5s',
            };
            const start = Date.now();
            const res = http.get(`${BASE_URL}/tasks`, params);
            console.log('List tasks response:', res.status, res.body); // <-- Debug log
            taskListDuration.add(Date.now() - start);
            const ok = check(res, {
                'list tasks status 200': (r) => r.status === 200,
                'list tasks is array': (r) => {
                    const body = typeof r.body === 'string' ? JSON.parse(r.body) : [];
                    return Array.isArray(body);
                },
            });
            successRate.add(ok);
            if (!ok) failures.add(1);
            // Find our created task
            const tasks = typeof res.body === 'string' ? JSON.parse(res.body) : [];
            const myTask = Array.isArray(tasks) ? tasks.find(t => t.title && t.title.startsWith(`Stress Task ${__VU}-${__ITER}`)) : undefined;
            if (myTask) createdTaskId = myTask.id;
            sleep(0.5);
        });

        // 3. Get Task by ID
        if (createdTaskId) {
            group('Get Task by ID', () => {
                const params = {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    tags: { type: 'get' },
                    timeout: '5s',
                };
                const res = http.get(`${BASE_URL}/tasks/${createdTaskId}`, params);
                console.log('Get task by ID response:', res.status, res.body); // <-- Debug log
                const ok = check(res, {
                    'get task status 200': (r) => r.status === 200,
                    'get task has correct id': (r) => {
                        const body = typeof r.body === 'string' ? JSON.parse(r.body) : {};
                        return body.id === createdTaskId;
                    },
                });
                successRate.add(ok);
                if (!ok) failures.add(1);
                sleep(0.5);
            });
        }

        // 4. Update Task
        if (createdTaskId) {
            group('Update Task', () => {
                const updatePayload = JSON.stringify({
                    title: `Updated Stress Task ${__VU}-${__ITER}`,
                    priority: 'HIGH',
                });
                const params = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    tags: { type: 'update' },
                    timeout: '5s',
                };
                const start = Date.now();
                const res = http.put(`${BASE_URL}/tasks/${createdTaskId}`, updatePayload, params);
                console.log('Update task response:', res.status, res.body); // <-- Debug log
                taskUpdateDuration.add(Date.now() - start);
                const ok = check(res, {
                    'update task status 200': (r) => r.status === 200,
                    'update task has message': (r) => {
                        const body = typeof r.body === 'string' ? JSON.parse(r.body) : {};
                        return body.message === 'Task updated successfully✅✅';
                    },
                });
                successRate.add(ok);
                if (!ok) failures.add(1);
                sleep(0.5);
            });
        }

        // 5. Delete Task (cleanup)
        if (createdTaskId) {
            group('Delete Task', () => {
                const params = {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    tags: { type: 'delete' },
                    timeout: '5s',
                };
                const start = Date.now();
                const res = http.del(`${BASE_URL}/tasks/${createdTaskId}`, null, params);
                console.log('Delete task response:', res.status, res.body); // <-- Debug log
                taskDeletionDuration.add(Date.now() - start);
                const ok = check(res, {
                    'delete task status 200': (r) => r.status === 200,
                    'delete task has message': (r) => {
                        const body = typeof r.body === 'string' ? JSON.parse(r.body) : {};
                        return body.message === 'Task deleted successfully✅';
                    },
                });
                successRate.add(ok);
                if (!ok) failures.add(1);
                sleep(0.5);
            });
        }
    });
}