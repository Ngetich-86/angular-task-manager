import request from "supertest";

jest.mock("../../src/drizzle/db", () => {
    const insert = jest.fn();
    const update = jest.fn();
    const del = jest.fn();
    const select = jest.fn();
    const query = {
        users: {
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

describe("Integration: POST /auth/login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    test("returns 404 when user not found", async () => {
        db.query.users.findFirst.mockResolvedValue(null);
        const res = await request(app).post("/auth/login").send({ email: "x@y.com", password: "p" });
        expect(res.status).toBe(404);
    });

    test("returns 403 when user deactivated", async () => {
        db.query.users.findFirst.mockResolvedValue({ id: 1, email: "a@b.com", password: "hash", role: "user", isActive: false });
        const res = await request(app).post("/auth/login").send({ email: "a@b.com", password: "any" });
        expect(res.status).toBe(403);
    });

    test("returns 401 when password invalid", async () => {
        // bcrypt.compare is used by controller; mock it to return false
        jest.spyOn(require("bcryptjs"), "compare").mockResolvedValueOnce(false as any);
        db.query.users.findFirst.mockResolvedValue({ id: 2, fullname: "U", email: "u@e.com", password: "hash", role: "user", isActive: true });
        const res = await request(app).post("/auth/login").send({ email: "u@e.com", password: "wrong" });
        expect(res.status).toBe(401);
    });

    test("returns 200 and token when credentials valid", async () => {
        jest.spyOn(require("bcryptjs"), "compare").mockResolvedValueOnce(true as any);
        db.query.users.findFirst.mockResolvedValue({ id: 3, fullname: "U", email: "u@e.com", password: "hash", role: "user", isActive: true });
        const res = await request(app).post("/auth/login").send({ email: "u@e.com", password: "ok" });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});


