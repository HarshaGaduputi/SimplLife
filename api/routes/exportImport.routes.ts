import { Router } from "express";
import { exportImportController } from "../controllers/exportImport.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/export", requireAuth, exportImportController.exportData);
router.post("/import", requireAuth, exportImportController.importData);

export default router;
