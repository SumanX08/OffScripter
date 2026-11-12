import { Router } from "express";

import { asyncHandler } from "../utils/async-handler.js";

import {
  submitFeedback,
  listMyFeedback,
  listAllFeedback,
  changeFeedbackStatus,
} from "../controllers/feedback.controller.js";

import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// User routes
router.post("/", asyncHandler(submitFeedback));
router.get("/", asyncHandler(listMyFeedback));

// Admin routes
router.get(
  "/admin",
  requireAdmin,
  asyncHandler(listAllFeedback)
);

router.patch(
  "/admin/:id",
  requireAdmin,
  asyncHandler(changeFeedbackStatus)
);

export default router;