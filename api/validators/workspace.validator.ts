import { z } from "zod";

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["personal", "team"]).optional(),
  organizationId: z.string().optional(),
});
