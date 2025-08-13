import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    const query = {
        users: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    };
    return {
        __esModule: true,
        default: { insert, update, delete: del, select, query },
    };
});

const db = require("../../src/drizzle/db").default as any;
const app = require("../../src/server").default as any;

describe("Integration: /auth admin routes - CRUD", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    function makeToken(role: "admin" | "user" = "admin") {
        return jwt.sign({ id: 1, sub: 1, user_id: 1, fullname: "Admin", email: "a@a.com", role, exp: Math.floor(Date.now() / 1000) + 3600 }, process.env.JWT_SECRET!);
    }

    test("GET /auth/users/:id returns 404 when not found", async () => {
        const token = makeToken("admin");
        db.query.users.findFirst.mockResolvedValueOnce(null);
        const res = await request(app).get("/auth/users/123").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("GET /auth/users/:id returns 200 when found", async () => {
        const token = makeToken("admin");
        db.query.users.findFirst.mockResolvedValueOnce({ id: 7, fullname: "U", email: "u@e.com", role: "user", isActive: true, createdAt: new Date().toISOString() });
        const res = await request(app).get("/auth/users/7").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(7);
    });

    test("PUT /auth/users/:id updates successfully", async () => {
        const token = makeToken("admin");
        db.query.users.findFirst.mockResolvedValueOnce({ id: 5 });
        db.update.mockReturnValue({ set: () => ({ where: jest.fn() }) });
        const res = await request(app)
            .put("/auth/users/5")
            .set("Authorization", `Bearer ${token}`)
            .send({ fullname: "New Name" });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/updated successfully/);
    });

    test("POST /auth/users/:id/deactivate deactivates account", async () => {
        const token = makeToken("admin");
        db.query.users.findFirst.mockResolvedValueOnce({ id: 8 });
        db.update.mockReturnValue({ set: () => ({ where: jest.fn() }) });
        const res = await request(app)
            .post("/auth/users/8/deactivate")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deactivated successfully/);
    });

    test("non-admin receives 403 on admin routes", async () => {
        const token = makeToken("user");
        const res = await request(app).get("/auth/users/1").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });
});


