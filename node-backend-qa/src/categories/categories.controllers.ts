import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";
import { CategoryService } from "./categories.service";

const categoryService = new CategoryService();

export class CategoryController {
  /** List all categories for the authenticated user */
  async getAllCategories(c: any) {
    const user = c.get("user");
    const categories = await categoryService.getAllCategories(user.id);
    return c.json(categories);
  }

  /** Get a specific category for the authenticated user */
  async getCategoryById(c: any) {
    const user = c.get("user");
    const { id } = c.req.param();
    const category = await categoryService.getCategoryById(id, user.id);
    if (!category) return c.json({ error: "Category not found" }, 404);
    return c.json(category);
  }

  /** Create a new category for the authenticated user */
  async createCategory(c: any) {
    const user = c.get("user");
    const input = createCategorySchema.parse(await c.req.json());
    const categoryData = {
      ...input,
      userId: user.id,
    };
    await categoryService.createCategory(categoryData);
    return c.json({ message: "Category created successfully" }, 201);
  }

  /** Update a category for the authenticated user */
  async updateCategory(c: any) {
    const user = c.get("user");
    const { id } = c.req.param();
    const input = updateCategorySchema.parse(await c.req.json());
    await categoryService.updateCategoryById(id, user.id, input);
    return c.json({ message: "Category updated successfully" });
  }

  /** Delete a category for the authenticated user */
  async deleteCategory(c: any) {
    const user = c.get("user");
    const { id } = c.req.param();
    await categoryService.deleteCategoryById(id, user.id);
    return c.json({ message: "Category deleted successfully" });
  }
}
