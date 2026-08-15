import { Router } from "express";
import { groupController } from "../controllers/group.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  CreateGroupSchema,
  UpdateGroupSchema,
  CreateTaskInGroupSchema,
} from "../validators/group.validator.js";

const router = Router();

router.get("/", requireAuth, groupController.list);
router.post("/", requireAuth, validate(CreateGroupSchema), groupController.create);
router.patch("/:id", requireAuth, validate(UpdateGroupSchema), groupController.update);
router.delete("/:id", requireAuth, groupController.delete);

router.get("/:id/tasks", requireAuth, groupController.listTasks);
router.post(
  "/:id/tasks",
  requireAuth,
  validate(CreateTaskInGroupSchema),
  groupController.createTask,
);

export default router;
