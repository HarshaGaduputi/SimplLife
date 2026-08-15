import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import templatesRoutes from "./routes/templates.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import trashRoutes from "./routes/trash.routes.js";
import exportImportRoutes from "./routes/exportImport.routes.js";
import stateSyncRoutes from "./routes/stateSync.routes.js";
import goalsRoutes from "./routes/goals.routes.js";
import habitsRoutes from "./routes/habits.routes.js";
import focusRoutes from "./routes/focus.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Application = express();

app.set("trust proxy", 1);

const corsOrigins = config.cors.origin.includes(",") 
  ? config.cors.origin.split(",").map(s => s.trim())
  : config.cors.origin;

app.use(
  cors({
    origin: corsOrigins,
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
  windowMs: config.rateLimit.general.windowMs,
  max: config.rateLimit.general.max,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api", exportImportRoutes);
app.use("/api/state", stateSyncRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/ai", aiRoutes);




app.get(
  "/api/health",
  (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: "ok",
      app: "SimplLife",
      demoMode: !config.hasDatabase,
    });
  },
);

app.use(errorHandler);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API not found",
  });
});

export default app;
