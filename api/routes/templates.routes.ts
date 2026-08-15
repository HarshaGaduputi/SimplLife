import { Router } from "express";
import { templateController } from "../controllers/template.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { ApplyTemplateSchema } from "../validators/template.validator.js";

const router = Router();

router.get("/", templateController.list);
router.post(
  "/apply",
  requireAuth,
  validate(ApplyTemplateSchema),
  templateController.apply,
);

export default router;
