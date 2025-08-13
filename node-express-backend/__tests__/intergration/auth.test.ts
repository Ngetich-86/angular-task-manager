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

describe("Integration: /auth protected users list", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    function makeToken(role: "admin" | "user" = "admin") {
        return jwt.sign({ id: 1, sub: 1, user_id: 1, fullname: "Admin", email: "a@a.com", role, exp: Math.floor(Date.now() / 1000) + 3600 }, process.env.JWT_SECRET!);
    }

    test("GET /auth/users requires admin role", async () => {
        const token = makeToken("user");
        const res = await request(app).get("/auth/users").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    test("GET /auth/users returns 200 for admin", async () => {
        const token = makeToken("admin");
        db.query.users.findMany.mockResolvedValue([{ id: 1 }]);
        const res = await request(app).get("/auth/users").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});


