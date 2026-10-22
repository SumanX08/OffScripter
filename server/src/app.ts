
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { requireAuthentication } from "./middleware/auth.middleware.js";
import { attachCurrentUser } from "./middleware/user.middleware.js";

import topicRoutes from "./routes/topic.route.js";
import attemptRoutes from "./routes/attempt.route.js";
import userRoutes from "./routes/user.route.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import paymentRoutes from "./routes/payment.route.js";

import { razorpayWebhook } from "./controllers/payment.controller.js";
import { prisma } from "./config/prisma.js";

const app = express();

app.use(cors());

// IMPORTANT: Razorpay needs the original raw body for signature verification.
// This must run before express.json().
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// Parse JSON for all other API requests.
app.use(express.json());

app.use(clerkMiddleware());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "offscripter-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use(
  "/api/users",
  requireAuthentication,
  userRoutes
);

app.use(
  "/api/topic",
  requireAuthentication,
  attachCurrentUser,
  topicRoutes
);

app.use(
  "/api/attempts",
  requireAuthentication,
  attachCurrentUser,
  attemptRoutes
);

app.use(
  "/api/evaluations",
  requireAuthentication,
  attachCurrentUser,
  evaluationRoutes
);

app.use(
  "/api/payments",
  requireAuthentication,
  attachCurrentUser,
  paymentRoutes
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
