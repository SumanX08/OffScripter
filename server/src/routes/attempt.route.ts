import { Router } from "express";

import { complete } from "../controllers/attempt.controller.js";

const router = Router();

router.patch("/:attemptId/complete", complete);

export default router;