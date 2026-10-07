import { z } from "zod";

export const CreateFocusSessionSchema = z.object({
  duration: z.number().positive(),
  taskId: z.string().min(1).optional().nullable(),
  taskTitle: z.string().optional().nullable(),
});
