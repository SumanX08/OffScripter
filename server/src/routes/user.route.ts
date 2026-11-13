
import { Router } from "express";
import {
  createMe,
  getMe,
  updateMe,
  updateReminderSettings,
} from "../controllers/user.controller.js";
import { attachCurrentUser } from "../middleware/user.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/me", asyncHandler(createMe));

router.get(
  "/me",
  attachCurrentUser,
  asyncHandler(getMe)
);

router.patch(
  "/me",
  attachCurrentUser,
  asyncHandler(updateMe)
);

router.patch(
  "/me/reminder-settings",
  attachCurrentUser,
  asyncHandler(updateReminderSettings)
);

export default router;
