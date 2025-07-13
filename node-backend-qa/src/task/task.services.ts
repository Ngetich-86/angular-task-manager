import { sql } from "drizzle-orm";
import db from "../drizzle/db";
import { tasks, categories } from "../drizzle/schema";

export class TaskService {
    async createTask(task: typeof tasks.$inferInsert) {
        await db.insert(tasks).values(task);
        return "Task created successfully";
    }

    async getAllTasks(userId: number) {
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId}`
        });
    }

    async getTaskById(id: string, userId: number) {
        return await db.query.tasks.findFirst({
            where: sql`${tasks.id} = ${id} AND ${tasks.userId} = ${userId}`
        });
    }

    async updateTaskById(id: string, userId: number, task: Partial<typeof tasks.$inferInsert>) {
        await db.update(tasks)
            .set(task)
            .where(sql`${tasks.id} = ${id} AND ${tasks.userId} = ${userId}`);
        return "Task updated successfully";
    }

    async deleteTaskById(id: string, userId: number) {
        await db.delete(tasks)
            .where(sql`${tasks.id} = ${id} AND ${tasks.userId} = ${userId}`);
        return "Task deleted successfully";
    }

    async getTasksByStatus(userId: number, status: string) {
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId} AND ${tasks.status} = ${status}`
        });
    }

    async getTasksByPriority(userId: number, priority: string) {
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId} AND ${tasks.priority} = ${priority}`
        });
    }

    async getTasksByCategory(userId: number, categoryId: number) {
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId} AND ${tasks.categoryId} = ${categoryId}`
        });
    }

    async toggleTaskCompletion(id: string, userId: number, completed: boolean) {
        await db.update(tasks)
            .set({ completed })
            .where(sql`${tasks.id} = ${id} AND ${tasks.userId} = ${userId}`);
        return "Task completion status updated";
    }

    async getCompletedTasks(userId: number) {
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId} AND ${tasks.completed} = true`
        });
    }

    async getPendingTasks(userId: number) {
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId} AND ${tasks.completed} = false`
        });
    }

    async getTasksDueToday(userId: number) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId} AND ${tasks.dueDate} >= ${startOfDay} AND ${tasks.dueDate} < ${endOfDay}`
        });
    }

    async getOverdueTasks(userId: number) {
        const now = new Date();
        
        return await db.query.tasks.findMany({
            where: sql`${tasks.userId} = ${userId} AND ${tasks.dueDate} < ${now} AND ${tasks.completed} = false`
        });
    }
}
