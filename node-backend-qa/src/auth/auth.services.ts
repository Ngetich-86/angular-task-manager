import { sql } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export class UserService {
    async createUser(user: typeof users.$inferInsert) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.insert(users).values({ ...user, password: hashedPassword });
        return "User created successfully";
    }

    async getUserByEmail(email: string) {
        return await db.query.users.findFirst({
            where: sql`${users.email} = ${email}`
        });
    }

    async loginUser(credentials: { email: string; password: string }) {
        const { email, password } = credentials;
        const user = await db.query.users.findFirst({
            columns: {
                id: true,
                fullname: true,
                email: true,
                password: true,
                role: true
            },
            where: sql`${users.email} = ${email}`
        });
        if (!user) throw new Error("User not found");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");
        // Don't return password
        const { password: _, ...userWithoutPassword } = user;
        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        return { user: userWithoutPassword, token };
    }

    async getAllUsers() {
        return await db.query.users.findMany({
            columns: {
                id: true,
                fullname: true,
                email: true,
                role: true,
                isActive: true
            }
        });
    }

    async updateUserById(id: string, user: Partial<typeof users.$inferInsert>) {
        if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }
        await db.update(users)
            .set(user)
            .where(sql`${users.id} = ${id}`);
        return "User updated successfully";
    }

    async getUserById(id: string) {
        return await db.query.users.findFirst({
            where: sql`${users.id} = ${id}`
        });
    }
}

