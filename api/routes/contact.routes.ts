import { Router } from "express";
import { contactController } from "../controllers/contact.controller.js";
import { validate } from "../middleware/validate.js";
import { ContactSchema } from "../validators/contact.validator.js";

const router = Router();

router.post("/", validate(ContactSchema), contactController.sendMessage);

export default router;
