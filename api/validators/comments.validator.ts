import { z } from "zod";

export const CreateCommentSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(["task", "goal", "note", "habit", "project"]),
  content: z.string().min(1),
  parentId: z.string().optional(),
});
