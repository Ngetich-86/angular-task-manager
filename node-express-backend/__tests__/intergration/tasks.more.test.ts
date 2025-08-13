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

describe("Integration: /tasks - extended coverage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    function makeToken() {
        return jwt.sign({ id: 1, sub: 1, user_id: 1, fullname: "User", email: "u@a.com", role: "user", exp: Math.floor(Date.now() / 1000) + 3600 }, process.env.JWT_SECRET!);
    }

    test("GET /tasks/:id returns 404 when not found", async () => {
        const token = makeToken();
        db.select.mockReturnValueOnce({ from: () => ({ where: () => [] }) });
        const res = await request(app).get("/tasks/999").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("GET /tasks/:id returns 200 when found", async () => {
        const token = makeToken();
        db.select.mockReturnValueOnce({ from: () => ({ where: () => [{ id: 2, userId: 1 }] }) });
        const res = await request(app).get("/tasks/2").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(2);
    });

    test("PUT /tasks/:id returns 400 on validation error", async () => {
        const token = makeToken();
        const res = await request(app)
            .put("/tasks/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ dueDate: "not-a-date" });
        expect(res.status).toBe(400);
    });

    test("PUT /tasks/:id returns 404 when not found", async () => {
        const token = makeToken();
        db.update.mockReturnValue({ set: () => ({ where: () => ({ returning: jest.fn().mockResolvedValue([]) }) }) });
        const res = await request(app)
            .put("/tasks/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "New" });
        expect(res.status).toBe(404);
    });

    test("PUT /tasks/:id updates successfully", async () => {
        const token = makeToken();
        db.update.mockReturnValue({ set: () => ({ where: () => ({ returning: jest.fn().mockResolvedValue([{}]) }) }) });
        const res = await request(app)
            .put("/tasks/1")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Updated" });
        expect(res.status).toBe(200);
    });

    test("PATCH /tasks/:id/complete toggles to true", async () => {
        const token = makeToken();
        // First: getTaskById
        db.select.mockReturnValueOnce({ from: () => ({ where: () => [{ id: 1, userId: 1, completed: false }] }) });
        // Then: update returning
        db.update.mockReturnValue({ set: () => ({ where: () => ({ returning: jest.fn().mockResolvedValue([{ completed: true }]) }) }) });

        const res = await request(app)
            .patch("/tasks/1/complete")
            .set("Authorization", `Bearer ${token}`)
            .send({ completed: true });
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
    });

    test("PATCH /tasks/:id/complete returns 404 when task missing", async () => {
        const token = makeToken();
        db.select.mockReturnValueOnce({ from: () => ({ where: () => [] }) });
        const res = await request(app)
            .patch("/tasks/1/complete")
            .set("Authorization", `Bearer ${token}`)
            .send({ completed: true });
        expect(res.status).toBe(404);
    });

    test("GET /tasks/status/:status returns 200", async () => {
        const token = makeToken();
        db.select.mockReturnValueOnce({ from: () => ({ where: () => [{ id: 1 }] }) });
        const res = await request(app).get("/tasks/status/pending").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /tasks/priority/:priority returns 400 when invalid", async () => {
        const token = makeToken();
        const res = await request(app).get("/tasks/priority/INVALID").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(400);
    });

    test("GET /tasks/due/today returns 200", async () => {
        const token = makeToken();
        db.select.mockReturnValueOnce({
            from: () => ({
                where: () => ({ orderBy: jest.fn().mockReturnValue([{ id: 1 }]) }),
                orderBy: jest.fn().mockReturnValue([{ id: 1 }]),
            })
        });
        const res = await request(app).get("/tasks/due/today").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /tasks/overdue returns 200", async () => {
        const token = makeToken();
        db.select.mockReturnValueOnce({
            from: () => ({
                where: () => ({ orderBy: jest.fn().mockReturnValue([{ id: 1 }]) }),
                orderBy: jest.fn().mockReturnValue([{ id: 1 }]),
            })
        });
        const res = await request(app).get("/tasks/overdue").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("DELETE /tasks/:id returns 200 on success", async () => {
        const token = makeToken();
        db.delete.mockReturnValueOnce({ where: () => ({ returning: jest.fn().mockResolvedValue([{}]) }) });
        const res = await request(app).delete("/tasks/1").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("DELETE /tasks/:id returns 404 when not found", async () => {
        const token = makeToken();
        db.delete.mockReturnValueOnce({ where: () => ({ returning: jest.fn().mockResolvedValue([]) }) });
        const res = await request(app).delete("/tasks/1").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});


