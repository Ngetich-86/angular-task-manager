import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    const query = {
        categories: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        }
    };
    return {
        __esModule: true,
        default: { insert, update, delete: del, select, query },
    };
});

const db = require("../../src/drizzle/db").default as any;
const app = require("../../src/server").default as any;

describe("Integration: /categories", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    function makeToken(role: "admin" | "user" = "user") {
        return jwt.sign({ id: 1, sub: 1, user_id: 1, fullname: "User", email: "u@a.com", role, exp: Math.floor(Date.now() / 1000) + 3600 }, process.env.JWT_SECRET!);
    }

    test("GET /categories returns list for authenticated user", async () => {
        const token = makeToken("user");
        db.query.categories.findMany = jest.fn().mockResolvedValue([{ id: 1, name: "Work" }]);
        const res = await request(app).get("/categories").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /categories creates category", async () => {
        const token = makeToken("user");
        db.query.categories.findFirst = jest.fn().mockResolvedValue(null);
        db.insert.mockReturnValue({ values: () => ({ returning: jest.fn().mockResolvedValue([{ id: 10, name: "New" }]) }) });
        const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "New", description: "D", color: "#ffffff", userId: 1 });
        expect(res.status).toBe(201);
    });
});


