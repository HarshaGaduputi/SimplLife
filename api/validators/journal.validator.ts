import { z } from "zod";

export const SaveJournalSchema = z.object({
  date: z.string().min(1),
  mood: z.enum(["great", "good", "okay", "bad", "terrible"]),
  gratitude: z.string().optional(),
  reflection: z.string().optional(),
});
