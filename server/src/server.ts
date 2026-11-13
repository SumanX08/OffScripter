
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { startReminderScheduler } from "./services/reminder.service.js";
import { startEmailOutboxWorker } from "./services/email-outbox.service.js";

const startServer = async () => {
  try {
    await prisma.$connect();

    const reminderTask = startReminderScheduler();
    const emailOutboxTask = startEmailOutboxWorker();

    const server = app.listen(env.PORT, () => {
      console.log(
        `OffScripter API running on http://localhost:${env.PORT}`
      );
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down...`);

      reminderTask.stop();
      emailOutboxTask.stop();

      server.close(async () => {
        await prisma.$disconnect();
        console.log("Database disconnected");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));

  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

void startServer();
