import { z } from "zod";

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(60).optional(),
});

export const CreateTaskInGroupSchema = z.object({
  title: z.string().min(1, "Title is required").max(240),
  description: z.string().max(2000).nullish(),
  order: z.number().int().optional(),
  templateId: z.string().nullable().optional(),
  priority: z.enum(["high", "medium", "low", "none"]).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  goalId: z.string().nullable().optional(),
});

export const GroupIdParamSchema = z.object({
  id: z.string().min(1),
});
