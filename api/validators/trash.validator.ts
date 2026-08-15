import { z } from "zod";

export const TrashItemParamsSchema = z.object({
  type: z.enum(["group", "task", "subtask"]),
  id: z.string().min(1),
});
