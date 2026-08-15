import { Router } from "express";
import { trashController } from "../controllers/trash.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, trashController.list);
router.post("/restore/:type/:id", requireAuth, trashController.restore);
router.delete("/empty", requireAuth, trashController.empty);
router.delete("/item/:type/:id", requireAuth, trashController.deleteItem);

export default router;
