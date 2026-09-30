import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { listEmployeeEvents } from "../controllers/eventController.js";
import { listMyDistributions } from "../controllers/distributionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/events", requireAuth, listEmployeeEvents);
router.get("/distributions", requireAuth, listMyDistributions);
export default router;
