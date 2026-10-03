import { Router } from "express";

import { spin } from "../controllers/topic.controller.js";

const router = Router();

router.post("/spin", spin);

export default router;