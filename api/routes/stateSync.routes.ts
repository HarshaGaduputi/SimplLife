import { Router } from "express";
import { stateSyncController } from "../controllers/stateSync.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.patch("/sync", requireAuth, stateSyncController.sync);

export default router;
