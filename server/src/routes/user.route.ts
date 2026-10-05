import { Router } from "express";
import { createMe, getMe } from "../controllers/user.controller.js";
import { attachCurrentUser } from "../middleware/user.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/me", asyncHandler(createMe));

router.get(
  "/me",
  attachCurrentUser,
  asyncHandler(getMe)
);

export default router;