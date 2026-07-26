import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "../db.js";
import { requireAuth, signToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

router.post("/register", async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }
  const { name, email, password } = parsed.data;
  const db = getDb();
  const existing = await db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({ success: false, error: "Email already in use" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.createUser({ name, email, passwordHash });
  const token = signToken(user.id);
  res.status(201).json({ success: true, token, user });
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }
  const { email, password } = parsed.data;
  const db = getDb();
  const record = await db.findUserByEmail(email);
  if (!record) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }
  const ok = await bcrypt.compare(password, record.passwordHash);
  if (!ok) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }
  const token = signToken(record.user.id);
  res.status(200).json({ success: true, token, user: record.user });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Logged out" });
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = await db.findUserById(req.userId!);
  if (!user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  res.status(200).json({ success: true, user });
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  digestEmailsEnabled: z.boolean().optional(),
});

router.patch("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }
  const db = getDb();
  const updated = await db.updateUser(req.userId!, parsed.data);
  if (!updated) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }
  res.status(200).json({ success: true, user: updated });
});

export default router;

