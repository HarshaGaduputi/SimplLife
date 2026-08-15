import { z } from "zod";

export const CreateHabitSchema = z.object({
  title: z.string().min(1),
  frequency: z.enum(["daily", "weekly", "monthly"]),
});

export const UpdateHabitSchema = z.object({
  title: z.string().min(1).optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  history: z.record(z.boolean()).optional(),
  streak: z.number().min(0).optional(),
});
