import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  fullname: text("fullname")
    .notNull()
    .$comment("Fullname must be between 3 and 50 characters"),

  email: text("email")
    .notNull()
    .unique()
    .$comment("Email must be valid and unique"),

  password: text("password")
    .notNull()
    .$comment("Password must be between 6 and 100 characters"),

  role: text("role")
    .notNull()
    .default("user"),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  updatedAt: timestamp("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`),
});

import { pgTable, serial, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ✅ Enum for task priority
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH"]);

// ✅ Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),

  title: text("title")
    .notNull()
    .$comment("Max 100 characters"),

  description: text("description"),

  status: text("status")
    .notNull()
    .$comment("Max 20 characters"),

  dueDate: timestamp("due_date", { mode: "date" })
    .notNull(),

  priority: priorityEnum("priority")
    .notNull(),

  completed: boolean("completed")
    .notNull()
    .default(false),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  updatedAt: timestamp("updated_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`),
});
