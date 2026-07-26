import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import groupsRoutes from "./routes/groups.js";
import tasksRoutes from "./routes/tasks.js";
import templatesRoutes from "./routes/templates.js";
import contactRoutes from "./routes/contact.js";
import trashRoutes from "./routes/trash.js";
import activityRoutes from "./routes/activity.js";
import exportImportRoutes from "./routes/exportImport.js";
import stateSyncRoutes from "./routes/stateSync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();

app.set("trust proxy", 1);

const CORS_ORIGIN =
  process.env.CORS_ORIGIN ||
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/;

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: false,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
    },
  }),
);

const generalLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api", exportImportRoutes);
app.use("/api/state", stateSyncRoutes);


app.get(
  "/api/health",
  (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: "ok",
      app: "SimplLife",
    });
  },
);

app.use(
  (
    error: Error & { statusCode?: number; issues?: unknown },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("[SimplLife API error]", error);
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: status >= 500 ? "Server internal error" : error.message || "Bad request",
      issues: (error.issues ?? undefined) as unknown,
    });
  },
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API not found",
  });
});

export default app;
