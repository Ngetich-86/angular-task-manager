import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { adminRoleAuth, bothRoleAuth } from "../../src/middleware/bearAuth";

describe("bearAuth middleware - unit", () => {
    let app: express.Express;

    beforeEach(() => {
        process.env.JWT_SECRET = "testsecret";
        app = express();
        app.get("/both", bothRoleAuth as unknown as express.RequestHandler, (req, res) => res.status(200).json({ ok: true }));
        app.get("/admin", adminRoleAuth as unknown as express.RequestHandler, (req, res) => res.status(200).json({ ok: true }));
    });

    function makeToken(role: "admin" | "user", overrides?: Partial<Record<string, any>>) {
        const payload = {
            sub: 1,
            user_id: 1,
            fullname: "Test User",
            email: "test@example.com",
            role,
            exp: Math.floor(Date.now() / 1000) + 3600,
            ...overrides,
        };
        return jwt.sign(payload, process.env.JWT_SECRET!);
    }

    test("returns 401 when no Authorization header", async () => {
        const res = await request(app).get("/both");
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/Unauthorized/);
    });

    test("returns 401 for invalid token", async () => {
        const res = await request(app).get("/both").set("Authorization", "Bearer invalid.token.here");
        expect(res.status).toBe(401);
    });

    test("returns 401 for expired token", async () => {
        const token = makeToken("user", { exp: Math.floor(Date.now() / 1000) - 10 });
        const res = await request(app).get("/both").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/expired/i);
    });

    test("allows both roles on /both", async () => {
        const userToken = makeToken("user");
        const adminToken = makeToken("admin");
        const resUser = await request(app).get("/both").set("Authorization", `Bearer ${userToken}`);
        const resAdmin = await request(app).get("/both").set("Authorization", `Bearer ${adminToken}`);
        expect(resUser.status).toBe(200);
        expect(resAdmin.status).toBe(200);
    });

    test("forbids user role on /admin", async () => {
        const token = makeToken("user");
        const res = await request(app).get("/admin").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
        expect(res.body.requiredRole).toBe("admin");
    });

    test("allows admin role on /admin", async () => {
        const token = makeToken("admin");
        const res = await request(app).get("/admin").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});


