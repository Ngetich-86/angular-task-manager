import { z } from "zod";

export const registerSchema = z.object({
  fullname: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["user", "admin", "superadmin", "disabled"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
