import { Router } from "express";
import { evaluate } from "../controllers/evaluation.controller.js";

const router = Router();

router.post("/:attemptId/evaluate", evaluate);

export default router;