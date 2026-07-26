import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getDb } from "../db.js";

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  email: z.string().email("Invalid email"),
  subject: z.string().min(2, "Subject is too short").max(160),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }
  const db = getDb();
  const { name, email, subject, message } = parsed.data;
  await db.createContactMessage({ name, email, subject, message });
  res.status(200).json({
    success: true,
    message: "Your message has been sent. We'll get back to you soon.",
  });
});

export default router;
