import { z } from "zod";

export const CreateFocusSessionSchema = z.object({
  duration: z.number().positive(),
  taskTitle: z.string().optional().nullable(),
});
