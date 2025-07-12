import { pgTable, serial, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";


// ✅ Enum
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH"]);
export const roleEnum = pgEnum("role", ["user", "admin", "superadmin","disabled"]);

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullname: text("fullname").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  color: text("color").notNull().default("#FFFFFF"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: serial("user_id").notNull().references(() => users.id, {
    onDelete: "cascade",
  })
});


// ✅ Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  dueDate: timestamp("due_date").notNull(),
  priority: priorityEnum("priority").notNull(),
  completed: boolean("completed").notNull().default(false),
  userId: serial("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: serial("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
