import { Hono } from "hono";
import { TaskController } from "./task.controllers";
import { userRoleAuth } from "../middlewares/bearAuth";

const taskController = new TaskController();
const taskRouter = new Hono();

// All routes require user authentication
// User ID is extracted from JWT token

taskRouter.post("/tasks", userRoleAuth, (c) => taskController.createTask(c));
taskRouter.get("/tasks", userRoleAuth, (c) => taskController.getAllTasks(c));
taskRouter.get("/tasks/:id", userRoleAuth, (c) => taskController.getTaskById(c));
taskRouter.put("/tasks/:id", userRoleAuth, (c) => taskController.updateTask(c));
taskRouter.delete("/tasks/:id", userRoleAuth, (c) => taskController.deleteTask(c));

// Filters

// Get tasks by status
// e.g. GET /tasks/status/completed
taskRouter.get("/tasks/status/:status", userRoleAuth, (c) => taskController.getTasksByStatus(c));

taskRouter.get("/tasks/priority/:priority", userRoleAuth, (c) => taskController.getTasksByPriority(c));
taskRouter.get("/tasks/category/:categoryId", userRoleAuth, (c) => taskController.getTasksByCategory(c));

// Special

taskRouter.post("/tasks/:id/toggle", userRoleAuth, (c) => taskController.toggleTaskCompletion(c));
taskRouter.get("/tasks/completed", userRoleAuth, (c) => taskController.getCompletedTasks(c));
taskRouter.get("/tasks/pending", userRoleAuth, (c) => taskController.getPendingTasks(c));
taskRouter.get("/tasks/due-today", userRoleAuth, (c) => taskController.getTasksDueToday(c));
taskRouter.get("/tasks/overdue", userRoleAuth, (c) => taskController.getOverdueTasks(c));

export default taskRouter;
