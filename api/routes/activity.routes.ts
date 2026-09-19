import { Router } from "express";
import { activityController } from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", activityController.list);

export default router;
