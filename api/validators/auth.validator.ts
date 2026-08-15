import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  digestEmailsEnabled: z.boolean().optional(),
});
