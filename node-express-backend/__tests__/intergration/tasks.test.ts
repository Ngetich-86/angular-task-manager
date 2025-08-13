import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    return {
        __esModule: true,
        default: { insert, update, delete: del, select },
    };
});

const db = require("../../src/drizzle/db").default as any;
const app = require("../../src/server").default as any;

describe("Integration: /tasks", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    function makeToken(role: "admin" | "user" = "user") {
        return jwt.sign({ id: 1, sub: 1, user_id: 1, fullname: "User", email: "u@a.com", role, exp: Math.floor(Date.now() / 1000) + 3600 }, process.env.JWT_SECRET!);
    }

    test("GET /tasks returns list for authenticated user", async () => {
        const token = makeToken();
        db.select.mockReturnValue({
            from: () => ({
                where: () => ({ orderBy: jest.fn().mockReturnValue([{ id: 1 }]) }),
                orderBy: jest.fn().mockReturnValue([{ id: 1 }]),
            })
        });
        const res = await request(app).get("/tasks").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /tasks creates task", async () => {
        const token = makeToken();
        db.insert.mockReturnValue({ values: () => ({ returning: jest.fn().mockResolvedValue([{ id: 5 }]) }) });
        const res = await request(app)
            .post("/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "T",
                dueDate: new Date().toISOString(),
                userId: 1,
                categoryId: 1,
                status: "pending",
                priority: "MEDIUM",
            });
        expect(res.status).toBe(201);
    });
});


