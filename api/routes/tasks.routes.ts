import { Router } from "express";
import { taskController } from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  UpdateTaskSchema,
  CreateSubtaskSchema,
  UpdateSubtaskSchema,
} from "../validators/task.validator.js";

const router = Router();

router.get("/upcoming", requireAuth, taskController.getUpcoming);
router.get("/all", requireAuth, taskController.listAll);

router.patch("/:id", requireAuth, validate(UpdateTaskSchema), taskController.update);
router.patch("/:id/complete", requireAuth, taskController.complete);
router.patch("/:id/uncomplete", requireAuth, taskController.uncomplete);
router.delete("/:id", requireAuth, taskController.delete);
router.post(
  "/:id/subtasks",
  requireAuth,
  validate(CreateSubtaskSchema),
  taskController.createSubtask,
);
router.post("/:id/ai-split", requireAuth, taskController.aiSplit);

router.patch(
  "/subtasks/:id",
  requireAuth,
  validate(UpdateSubtaskSchema),
  taskController.updateSubtask,
);
router.delete("/subtasks/:id", requireAuth, taskController.deleteSubtask);

export default router;
