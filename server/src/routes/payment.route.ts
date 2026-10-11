import { Router } from "express";
import {
  subscribe,
  subscriptionStatus,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/subscribe", subscribe);
router.post("/verify", verifyPayment);
router.get("/status", subscriptionStatus);

export default router;