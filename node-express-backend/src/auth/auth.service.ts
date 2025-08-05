import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import type { TIUser } from "../drizzle/schema";

export const createUserService = async (user: TIUser) => {
    await db.insert(users).values(user);
    return "User created successfully";
};

export const getUserByEmailService = async (email: string) => {
    return await db.query.users.findFirst({
        where: eq(users.email, email)
    });
};

export const verifyUserService = async (email: string) => {
    await db.update(users)
        .set({ isActive: true }) // Using isActive instead of isVerified
        .where(eq(users.email, email));
    return "User verified successfully";
};

export const userLoginService = async (email: string, password: string) => {
    return await db.query.users.findFirst({
        columns: {
            id: true,
            fullname: true,
            email: true,
            password: true,
            role: true,
            isActive: true
        },
        where: eq(users.email, email)
    });
};

export const getAllUsersService = async () => {
    return await db.query.users.findMany({
        columns: {
            id: true,
            fullname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    });
};

export const updateUserByIdService = async (id: number, user: Partial<typeof users>) => {
    await db.update(users)
        .set({
            ...user,
            updatedAt: new Date() // Auto-update the updatedAt field
        })
        .where(eq(users.id, id));
    return "User updated successfully";
};

export const getUserByIdService = async (id: number) => {
    return await db.query.users.findFirst({
        where: eq(users.id, id)
    });
};

export const deactivateUserService = async (id: number) => {
    await db.update(users)
        .set({ isActive: false })
        .where(eq(users.id, id));
    return "User deactivated successfully";
};