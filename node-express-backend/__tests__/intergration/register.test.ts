import request from "supertest";

jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    const query = {
        users: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
        },
    };
    return {
        __esModule: true,
        default: { insert, update, delete: del, select, query },
    };
});

const db = require("../../src/drizzle/db").default as any;
const app = require("../../src/server").default as any;

describe("Integration: POST /auth/register", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    test("registers a new user and returns 201", async () => {
        db.query.users.findFirst.mockResolvedValue(null);
        db.insert.mockReturnValue({
            values: () => ({ returning: jest.fn().mockResolvedValue([{ id: 1 }]) }),
        });

        const res = await request(app)
            .post("/auth/register")
            .send({
                fullname: "John Doe",
                email: "john@example.com",
                password: "Password123!",
            });

        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/User created successfully/);
        expect(res.body.user).toMatchObject({ id: 1, email: "john@example.com" });
    });

    test("returns 400 if user already exists", async () => {
        db.query.users.findFirst.mockResolvedValue({ id: 1 });

        const res = await request(app)
            .post("/auth/register")
            .send({ fullname: "Jane", email: "jane@example.com", password: "123" });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already exists/);
    });
});


