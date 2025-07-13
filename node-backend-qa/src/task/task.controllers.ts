import { 
    createTaskSchema, 
    updateTaskSchema, 
    taskStatusSchema, 
    taskCompletionSchema 
} from "../validators/task.validator";
import { TaskService } from "./task.services";

const taskService = new TaskService();

export class TaskController {
    /** List all tasks for the authenticated user */
    async getAllTasks(c: any) {
        const user = c.get("user");
        const tasks = await taskService.getAllTasks(user.id);
        return c.json(tasks);
    }

    /** Get a specific task for the authenticated user */
    async getTaskById(c: any) {
        const user = c.get("user");
        const { id } = c.req.param();
        const task = await taskService.getTaskById(id, user.id);
        if (!task) return c.json({ error: "Task not found" }, 404);
        return c.json(task);
    }

    /** Create a new task for the authenticated user */
    async createTask(c: any) {
        const user = c.get("user");
        const input = createTaskSchema.parse(await c.req.json());
        const taskData = {
            ...input,
            userId: user.id,
            dueDate: new Date(input.dueDate)
        };
        await taskService.createTask(taskData);
        return c.json({ message: "Task created successfully" }, 201);
    }

    /** Update a task for the authenticated user */
    async updateTask(c: any) {
        const user = c.get("user");
        const { id } = c.req.param();
        const input = updateTaskSchema.parse(await c.req.json());
        const taskData: any = { ...input };
        if (input.dueDate) taskData.dueDate = new Date(input.dueDate);
        await taskService.updateTaskById(id, user.id, taskData);
        return c.json({ message: "Task updated successfully" });
    }

    /** Delete a task for the authenticated user */
    async deleteTask(c: any) {
        const user = c.get("user");
        const { id } = c.req.param();
        await taskService.deleteTaskById(id, user.id);
        return c.json({ message: "Task deleted successfully" });
    }

    /** Get tasks by status for the authenticated user */
    async getTasksByStatus(c: any) {
        const user = c.get("user");
        const { status } = c.req.param();
        const tasks = await taskService.getTasksByStatus(user.id, status);
        return c.json(tasks);
    }

    /** Get tasks by priority for the authenticated user */
    async getTasksByPriority(c: any) {
        const user = c.get("user");
        const { priority } = c.req.param();
        const tasks = await taskService.getTasksByPriority(user.id, priority);
        return c.json(tasks);
    }

    /** Get tasks by category for the authenticated user */
    async getTasksByCategory(c: any) {
        const user = c.get("user");
        const { categoryId } = c.req.param();
        const tasks = await taskService.getTasksByCategory(user.id, parseInt(categoryId));
        return c.json(tasks);
    }

    /** Toggle completion for a task */
    async toggleTaskCompletion(c: any) {
        const user = c.get("user");
        const { id } = c.req.param();
        const input = taskCompletionSchema.parse(await c.req.json());
        await taskService.toggleTaskCompletion(id, user.id, input.completed);
        return c.json({ message: "Task completion status updated" });
    }

    /** Get completed tasks for the authenticated user */
    async getCompletedTasks(c: any) {
        const user = c.get("user");
        const tasks = await taskService.getCompletedTasks(user.id);
        return c.json(tasks);
    }

    /** Get pending tasks for the authenticated user */
    async getPendingTasks(c: any) {
        const user = c.get("user");
        const tasks = await taskService.getPendingTasks(user.id);
        return c.json(tasks);
    }

    /** Get tasks due today for the authenticated user */
    async getTasksDueToday(c: any) {
        const user = c.get("user");
        const tasks = await taskService.getTasksDueToday(user.id);
        return c.json(tasks);
    }

    /** Get overdue tasks for the authenticated user */
    async getOverdueTasks(c: any) {
        const user = c.get("user");
        const tasks = await taskService.getOverdueTasks(user.id);
        return c.json(tasks);
    }
}
