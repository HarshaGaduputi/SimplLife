import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  RegisterSchema,
  LoginSchema,
  UpdateUserSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.getMe);
router.patch("/me", requireAuth, validate(UpdateUserSchema), authController.updateMe);

export default router;
