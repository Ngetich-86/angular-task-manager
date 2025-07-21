import { Hono } from "hono";
import { CategoryController } from "./categories.controllers";
import { userRoleAuth } from "../middlewares/bearAuth";

const categoryController = new CategoryController();
const categoryRouter = new Hono();

// All routes require user authentication
categoryRouter.post("/categories", userRoleAuth, (c) => categoryController.createCategory(c));
categoryRouter.get("/categories", userRoleAuth, (c) => categoryController.getAllCategories(c));
categoryRouter.get("/categories/:id", userRoleAuth, (c) => categoryController.getCategoryById(c));
categoryRouter.put("/categories/:id", userRoleAuth, (c) => categoryController.updateCategory(c));
categoryRouter.delete("/categories/:id", userRoleAuth, (c) => categoryController.deleteCategory(c));

export default categoryRouter;
