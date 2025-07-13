import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import "dotenv/config";
import { categories, users } from "./schema";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create default categories for user ID 1 (assuming user exists)
    const defaultCategories = [
      {
        name: "Work",
        description: "Work-related tasks and projects",
        color: "#3B82F6",
        userId: 1
      },
      {
        name: "Personal",
        description: "Personal tasks and activities",
        color: "#10B981",
        userId: 1
      },
      {
        name: "Health",
        description: "Health and fitness related tasks",
        color: "#EF4444",
        userId: 1
      },
      {
        name: "Learning",
        description: "Educational and skill development tasks",
        color: "#8B5CF6",
        userId: 1
      },
      {
        name: "Finance",
        description: "Financial planning and budgeting tasks",
        color: "#F59E0B",
        userId: 1
      }
    ];

    const createdCategories = await db.insert(categories).values(defaultCategories).returning();
    console.log("✅ Created categories:", createdCategories.map(c => c.name));

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed().catch(console.error);
