import { testClient } from 'hono/testing';
import app from "../../src/server";
import db from "../../src/drizzle/db";
import bcrypt from 'bcryptjs';
import { users } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";
import { json } from 'zod';

type AppType = typeof app;

const client: any = testClient<AppType>(app);

// Generate a unique email for each test run
const uniqueEmail = `test+${Date.now()}@example.com`;
const testUser = {
    email: uniqueEmail,
    password: "password123",
    role: "user"  as const,
    fullname: "Test User"
};


beforeAll(async () => {
  // Clean up any existing user with the test email
  await db.delete(users).where(eq(users.email, testUser.email));
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await db.insert(users).values({
    ...testUser,
    password: hashedPassword,
  });
});

afterAll(async () =>{
    //clean up test user
    await db.delete(users).where(eq(users.email, testUser.email));
    await client.$client.end()
});

describe("POST /login", () => {
    it("should return a token for valid credentials", async () => {
        const response = await client.login.$post({
            json: {
                ...testUser,
                password: testUser.password
            }
        });
        // Expect a 200 OK response
        expect(response.status).toBe(200);
        const body = await response.json();
        // Expect a token in the response (inside body.user)
        expect(body.user).toHaveProperty('token');
        expect(body.user.token).toBeDefined();
        expect(typeof body.user.token).toBe('string');
        expect(body.user.token.length).toBeGreaterThan(0);
        // Optionally, check user info
        expect(body.user.user).toMatchObject({
          email: testUser.email,
          role: testUser.role,
          fullname: testUser.fullname,
        });
    })
    it("should return 401 for invalid credentials(wrong password)", async () => {
        const response = await client.login.$post({
            json: {
                email: testUser.email,
                password: "wrongpassword"
            }
        });
        expect(response.status).toBe(401);
        const body = await response.json();
        // expect(body).toEqual({
        //     error: "Unauthorized",
        //     message: "Invalid email or password"
        // });
        expect(body).toEqual({
  error: "Invalid credentials"
});
    });
    it("should return 404 for non-existing user", async () => {
        const response = await client.login.$post({
            json: {
                email: `nonexistent+${Date.now()}@example.com`,
                password: "password123"
            }
        });
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toEqual({
            error: "User not found"
        });
    });
})