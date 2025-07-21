import { sql } from "drizzle-orm";
import db from "../drizzle/db";
import { categories } from "../drizzle/schema";

export class CategoryService {
  async createCategory(category: typeof categories.$inferInsert) {
    await db.insert(categories).values(category);
    return "Category created successfully";
  }

  async getAllCategories(userId: number) {
    return await db.query.categories.findMany({
      where: sql`${categories.userId} = ${userId}`
    });
  }

  async getCategoryById(id: string, userId: number) {
    return await db.query.categories.findFirst({
      where: sql`${categories.id} = ${id} AND ${categories.userId} = ${userId}`
    });
  }

  async updateCategoryById(id: string, userId: number, category: Partial<typeof categories.$inferInsert>) {
    await db.update(categories)
      .set(category)
      .where(sql`${categories.id} = ${id} AND ${categories.userId} = ${userId}`);
    return "Category updated successfully";
  }

  async deleteCategoryById(id: string, userId: number) {
    await db.delete(categories)
      .where(sql`${categories.id} = ${id} AND ${categories.userId} = ${userId}`);
    return "Category deleted successfully";
  }
}
