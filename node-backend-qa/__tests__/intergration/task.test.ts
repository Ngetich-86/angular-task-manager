import { testClient } from 'hono/testing';
import app from "../../src/server";
import db from "../../src/drizzle/db";
import { users, tasks, categories } from "../../src/drizzle/schema";
import { eq, and } from "drizzle-orm";

// Use a unique email and category name for every test run
const uniqueTimestamp = Date.now();
const uniqueCategoryName = `Test Category ${uniqueTimestamp}`;

const testUser = {
    fullname: "Task User",
    email: `taskuser+${uniqueTimestamp}@example.com`,
    password: "password123"
};

type AppType = typeof app;
const client: any = testClient<AppType>(app);

let testUserId: number;
let authToken: string;
let testCategoryId: number;

beforeAll(async () => {
    // Clean up any existing user with this email
    await db.delete(users).where(eq(users.email, testUser.email));
    // Register the user via the API
    const registerResponse = await client.register.$post({ json: testUser });
    if (registerResponse.status !== 201) {
        throw new Error(`User registration failed: ${registerResponse.status}`);
    }
    // Log in to get the token
    const loginResponse = await client.login.$post({
        json: { email: testUser.email, password: testUser.password }
    });
    if (loginResponse.status !== 200) {
        throw new Error(`Login failed: ${loginResponse.status}`);
    }
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;

    // Query the user from the DB to ensure it exists and get the real ID
    const [userRow] = await db.select().from(users).where(eq(users.email, testUser.email));
    console.log('User row after registration:', userRow);
    if (!userRow) throw new Error("User not found in DB after registration");
    testUserId = userRow.id;

    // Now insert the category for this user
    const insertedCategory = await db.insert(categories).values({
        name: uniqueCategoryName,
        description: "A category for testing",
        userId: testUserId
    }).returning();
    testCategoryId = insertedCategory[0].id;
});
afterAll(async () => {
    if (testUserId) {
        await db.delete(tasks).where(eq(tasks.userId, testUserId));
        await db.delete(categories).where(and(eq(categories.userId, testUserId), eq(categories.name, uniqueCategoryName)));
        await db.delete(users).where(eq(users.id, testUserId));
    }
    await client.$client.end();
});

describe("Task API Integration Tests", () => {
    describe("POST /tasks", () => {
        it("should create a new task", async () => {
            const taskData = {
                title: "New Task",
                description: "Task description",
                dueDate: new Date().toISOString(),
                status: "pending",
                priority: "MEDIUM",
                categoryId: testCategoryId
            };
            // Send both header casings to ensure middleware receives the token
            const response = await client.tasks.$post({
                json: taskData,
                headers: {
                    authorization: `Bearer ${authToken}`,
                    Authorization: `Bearer ${authToken}`
                }
            });
            expect(response.status).toBe(201);
            const body = await response.json();
            expect(body).toEqual({ message: "Task created successfully" });
        });

        it("should fail with 400 if required fields are missing", async () => {
            const taskData = {
                // title is missing
                description: "No title",
                dueDate: new Date().toISOString(),
                status: "pending",
                priority: "MEDIUM",
                categoryId: testCategoryId
            };
            // Send both header casings to ensure middleware receives the token
            const response = await client.tasks.$post({
                json: taskData,
                headers: {
                    authorization: `Bearer ${authToken}`,
                    Authorization: `Bearer ${authToken}`
                }
            });
            expect(response.status).toBe(400);
        });

        // it("should fail with 400 if categoryId does not exist", async () => {
        //     const taskData = {
        //         title: "Invalid Category",
        //         description: "Should fail",
        //         dueDate: new Date().toISOString(),
        //         status: "pending",
        //         priority: "MEDIUM",
        //         categoryId: 999999 // unlikely to exist
        //     };
        //     const response = await client.tasks.$post({
        //         json: taskData,
        //         headers: { Authorization: `Bearer ${authToken}` }
        //     });
        //     expect(response.status).toBe(400);
        // });

        it("should fail with 401 if not authenticated", async () => {
            const taskData = {
                title: "No Auth",
                description: "Should fail",
                dueDate: new Date().toISOString(),
                status: "pending",
                priority: "MEDIUM",
                categoryId: testCategoryId
            };
            const response = await client.tasks.$post({
                json: taskData
            });
            expect(response.status).toBe(401);
        });
    });
});