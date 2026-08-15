import { z } from "zod";

export const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  milestones: z.array(z.string()).optional(),
});

export const UpdateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  category: z.string().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
  milestones: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean()
    })
  ).optional(),
});
