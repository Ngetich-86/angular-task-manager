import { registerSchema, loginSchema } from "../validators/user.validator";
import { UserService } from "./auth.services";
import { appLogger } from "../middlewares/logger";

const userService = new UserService();

export class UserController {
    async register(ctx: any) {
        const body = await ctx.req.json();
        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            appLogger.warning("Registration validation failed", parsed.error.issues);
            return ctx.json({ error: parsed.error.issues }, 400);
        }
        try {
            await userService.createUser(parsed.data);
            appLogger.success("User registered successfully", { email: parsed.data.email });
            return ctx.json({ message: "User registered successfully" }, 201);
        } catch (err) {
            appLogger.error("Registration failed", err);
            return ctx.json({ error: (err as Error).message }, 500);
        }
    }

    async login(ctx: any) {
        const body = await ctx.req.json();
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            appLogger.warning("Login validation failed", parsed.error.issues);
            return ctx.json({ error: parsed.error.issues }, 400);
        }
        try {
            const user = await userService.loginUser(parsed.data);
            appLogger.success("User logged in successfully", { email: parsed.data.email });
            // TODO: Generate JWT and return
            return ctx.json({ user });
        } catch (err) {
            appLogger.error("Login failed", err);
            return ctx.json({ error: (err as Error).message }, 401);
        }
    }

    async getAll(ctx: any) {
        const users = await userService.getAllUsers();
        return ctx.json({ users });
    }

    async getById(ctx: any) {
        const { id } = ctx.req.param();
        const user = await userService.getUserById(id);
        if (!user) return ctx.json({ error: "User not found" }, 404);
        return ctx.json({ user });
    }

    async update(ctx: any) {
        const { id } = ctx.req.param();
        const body = await ctx.req.json();
        try {
            await userService.updateUserById(id, body);
            return ctx.json({ message: "User updated successfully" });
        } catch (err) {
            return ctx.json({ error: (err as Error).message }, 500);
        }
    }
}
