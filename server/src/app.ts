import express from 'express'
import cors from 'cors'
import { notFoundHandler } from './middleware/not-found.middleware.js'
import { errorHandler } from './middleware/error.middleware.js'
import topicRoutes from "./routes/topic.route.js";
import attemptRoutes from "./routes/attempt.route.js";

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "offscripter-api",
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/topic',topicRoutes)
app.use("/api/attempts", attemptRoutes);

app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;

