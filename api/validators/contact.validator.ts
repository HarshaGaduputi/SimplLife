import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  email: z.string().email("Invalid email"),
  subject: z.string().min(2, "Subject is too short").max(160),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});
