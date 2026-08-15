import { z } from "zod";

export const AiChatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
});
export const AiBreakdownSchema = z.object({
  taskTitle: z.string().min(1)
});
export const AiPrioritizeSchema = z.object({
  tasks: z.array(z.object({ id: z.string(), title: z.string(), dueDate: z.string().nullable().optional() })).min(1),
});
export const AiSummarizeNoteSchema = z.object({
  content: z.string().min(1),
});
export const AiSearchSchema = z.object({
  query: z.string().min(1),
});
export const AiEmailSchema = z.object({
  type: z.enum(['followup', 'meeting', 'status', 'thankyou']),
  context: z.string().min(1),
});
