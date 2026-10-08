import express from 'express'
import cors from 'cors'
import { notFoundHandler } from './middleware/not-found.middleware.js'
import { errorHandler } from './middleware/error.middleware.js'
import topicRoutes from "./routes/topic.route.js";
import attemptRoutes from "./routes/attempt.route.js";
import { clerkMiddleware } from '@clerk/express'
import { requireAuthentication } from "./middleware/auth.middleware.js";
import userRoutes from "./routes/user.route.js";
import { attachCurrentUser } from "./middleware/user.middleware.js";
import evaluationRoutes from "./routes/evaluation.routes.js";


const app = express()

app.use(cors())
app.use(express.json())

app.use(clerkMiddleware())

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
    console.error(
      "Database health check failed:",
      error
    );

    res.status(500).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use("/api/users",requireAuthentication,userRoutes);

app.use('/api/topic',requireAuthentication,attachCurrentUser,topicRoutes)
app.use("/api/attempts", requireAuthentication, attachCurrentUser,attemptRoutes);
app.use(
  "/api/evaluations",
  requireAuthentication,
  attachCurrentUser,
  evaluationRoutes
);

app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;

