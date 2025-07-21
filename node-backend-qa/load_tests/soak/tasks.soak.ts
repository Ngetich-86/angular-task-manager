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
    vus: 10, // Number of concurrent users
    duration: '1h', // Soak test duration
    thresholds: {
        'http_req_failed': ['rate<0.05'],
        'success_rate': ['rate>0.95'],
        'task_creation_duration': ['p(95)<1000'],
        'task_list_duration': ['p(95)<1000'],
        'task_update_duration': ['p(95)<1000'],
        'task_deletion_duration': ['p(95)<1000'],
    },
};

// Authenticate once in setup and share token
export function setup() {
    const payload = JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
    const params = {
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'k6-soak-test/1.0' },
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

    group('Task Soak Test', () => {
        // 1. Create Task
        group('Create Task', () => {
            const taskPayload = JSON.stringify({
                title: `Soak Task ${__VU}-${__ITER}`,
                description: 'Created during soak test',
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'MEDIUM',
                categoryId: Number(CATEGORY_ID),
            });
            const params = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'User-Agent': 'k6-soak-test/1.0',
                },
                tags: { type: 'create' },
                timeout: '5s',
            };
            const start = Date.now();
            const res = http.post(`${BASE_URL}/tasks`, taskPayload, params);
            taskCreationDuration.add(Date.now() - start);
            const ok = check(res, {
                'create task status 201': (r) => r.status === 201,
            });
            successRate.add(ok);
            if (!ok) {
                failures.add(1);
                // Don't fail the whole test, just record the error
            }
            sleep(1); // Simulate user think time
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
            taskListDuration.add(Date.now() - start);
            const ok = check(res, {
                'list tasks status 200': (r) => r.status === 200,
            });
            successRate.add(ok);
            if (!ok) failures.add(1);
            // Find our created task
            const tasks = typeof res.body === 'string' ? JSON.parse(res.body) : [];
            const myTask = Array.isArray(tasks) ? tasks.find(t => t.title && t.title.startsWith(`Soak Task ${__VU}-${__ITER}`)) : undefined;
            if (myTask) createdTaskId = myTask.id;
            sleep(1);
        });

        // 3. Update Task
        if (createdTaskId) {
            group('Update Task', () => {
                const updatePayload = JSON.stringify({
                    title: `Updated Soak Task ${__VU}-${__ITER}`,
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
                taskUpdateDuration.add(Date.now() - start);
                const ok = check(res, {
                    'update task status 200': (r) => r.status === 200,
                });
                successRate.add(ok);
                if (!ok) failures.add(1);
                sleep(1);
            });
        }

        // 4. Delete Task (cleanup)
        if (createdTaskId) {
            group('Delete Task', () => {
                const params = {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    tags: { type: 'delete' },
                    timeout: '5s',
                };
                const start = Date.now();
                const res = http.del(`${BASE_URL}/tasks/${createdTaskId}`, null, params);
                taskDeletionDuration.add(Date.now() - start);
                const ok = check(res, {
                    'delete task status 200': (r) => r.status === 200,
                });
                successRate.add(ok);
                if (!ok) failures.add(1);
                sleep(1);
            });
        }
    });
}