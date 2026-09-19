import { z } from "zod";

export const TaskIdParamSchema = z.object({
  id: z.string().min(1),
});

export const SubtaskIdParamSchema = z.object({
  id: z.string().min(1),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(240).optional(),
  description: z.string().max(2000).nullable().optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
  templateId: z.string().nullable().optional(),
  priority: z.enum(["high", "medium", "low", "none"]).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  goalId: z.string().nullable().optional(),
});

export const CreateSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().optional(),
});

export const UpdateSubtaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
});
