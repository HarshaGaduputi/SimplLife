import { z } from "zod";

export const ApplyTemplateSchema = z.object({
  templateId: z.string().min(1),
  groupId: z.string().min(1),
  mainTaskName: z.string().min(1, "Main task name is required").max(240),
});
