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

describe("Integration: /categories CRUD - more coverage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    function makeToken() {
        return jwt.sign({ id: 1, sub: 1, user_id: 1, fullname: "User", email: "u@a.com", role: "user", exp: Math.floor(Date.now() / 1000) + 3600 }, process.env.JWT_SECRET!);
    }

    test("GET /categories/:id returns 404 when not found", async () => {
        const token = makeToken();
        db.query.categories.findFirst.mockResolvedValueOnce(null);
        const res = await request(app).get("/categories/999").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("GET /categories/:id returns 200 when found", async () => {
        const token = makeToken();
        db.query.categories.findFirst.mockResolvedValueOnce({ id: 2, userId: 1, name: "Work" });
        const res = await request(app).get("/categories/2").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(2);
    });

    test("PUT /categories/:id returns 400 on name conflict", async () => {
        const token = makeToken();
        // First call: name conflict check
        db.query.categories.findFirst.mockResolvedValueOnce({ id: 99, name: "Existing", userId: 1 });
        const res = await request(app)
            .put("/categories/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Existing" });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/already exists/);
    });

    test("PUT /categories/:id updates successfully", async () => {
        const token = makeToken();
        // First: name check - no conflict
        db.query.categories.findFirst
            .mockResolvedValueOnce(null) // name check
            .mockResolvedValueOnce({ id: 1, userId: 1, name: "Old" }); // getCategoryById inside service
        db.update.mockReturnValue({ set: () => ({ where: () => ({ returning: jest.fn().mockResolvedValue([{ id: 1, name: "New" }]) }) }) });

        const res = await request(app)
            .put("/categories/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "New" });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/updated successfully/);
    });

    test("DELETE /categories/:id returns 404 when not found", async () => {
        const token = makeToken();
        db.query.categories.findFirst.mockResolvedValueOnce(null);
        const res = await request(app)
            .delete("/categories/1")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("DELETE /categories/:id returns 200 on success", async () => {
        const token = makeToken();
        db.query.categories.findFirst.mockResolvedValueOnce({ id: 1, userId: 1 });
        db.delete.mockReturnValue({ where: () => undefined });
        const res = await request(app)
            .delete("/categories/1")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("POST /categories validation failure returns 400", async () => {
        const token = makeToken();
        const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "", description: "", color: "invalid" });
        expect(res.status).toBe(400);
    });
});


