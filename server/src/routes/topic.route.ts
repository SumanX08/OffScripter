import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { spin } from "../controllers/topic.controller.js";

const router = Router();

router.post("/spin", asyncHandler(spin));

export default router;