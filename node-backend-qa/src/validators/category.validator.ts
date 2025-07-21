import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(255),
  color: z.string().min(4).max(7).regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "Invalid color hex code").optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(255).optional(),
  color: z.string().min(4).max(7).regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "Invalid color hex code").optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>; 