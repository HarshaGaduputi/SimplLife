import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = (process.env.JWT_SECRET as string) || "tasknest-dev-secret-change-me";

if (isProduction && (jwtSecret === "tasknest-dev-secret-change-me" || jwtSecret === "tasknest-dev-secret-change-me-in-production")) {
  throw new Error("FATAL: Default JWT_SECRET is not allowed in production.");
}

const hasDatabase = !!process.env.DATABASE_URL;
if (!hasDatabase) {
  if (isProduction) {
    console.error("FATAL: DATABASE_URL is required in production.");
    process.exit(1);
  }
  console.warn("⚠️ WARNING: Running in DEMO MODE. Database is not connected (no DATABASE_URL). Data will reset on server restart.");
}

export const config = {
  isProduction,
  hasDatabase,
  port: Number(process.env.PORT || 3001),
  jwt: {
    secret: jwtSecret,
    expiresIn: "7d" as const,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  rateLimit: {
    general: {
      windowMs: 60_000,
      max: 200,
    },
    auth: {
      windowMs: 10 * 60 * 1000,
      max: 20,
    },
  },
  ai: {
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL || "https://api.openai.com/v1",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    temperature: Number(process.env.AI_TEMPERATURE || 0.7),
    maxTokens: Number(process.env.AI_MAX_TOKENS || 1000),
  },
  trash: {
    autoEmptyDays: 30,
  },
  smtp: {
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    fromEmail: process.env.SMTP_FROM_EMAIL || "no-reply@simpllife.com",
    fromName: process.env.SMTP_FROM_NAME || "SimplLife",
  },
};
