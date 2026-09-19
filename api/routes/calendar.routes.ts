import { Router } from "express";
import { calendarController } from "../controllers/calendar.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", calendarController.listEvents);
router.post("/", calendarController.createEvent);
router.patch("/:id", calendarController.updateEvent);
router.delete("/:id", calendarController.deleteEvent);

export default router;
