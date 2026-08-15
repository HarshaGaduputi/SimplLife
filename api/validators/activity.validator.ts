import { z } from "zod";

export const ActivityQuerySchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
});
