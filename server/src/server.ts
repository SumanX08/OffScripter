
import { createServer } from "node:http";

import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { startReminderScheduler } from
  "./services/reminder.service.js";
import { startEmailOutboxWorker } from
  "./services/email-outbox.service.js";

import { initializeWebSocketServer } from
  "./websocket/websocket.server.js";

const startServer = async () => {
  try {
    await prisma.$connect();

    const reminderTask = startReminderScheduler();
    const emailOutboxTask = startEmailOutboxWorker();

    const server = createServer(app);

    // Initialize WebSocket server.
    const wss = initializeWebSocketServer(server);

    server.listen(env.PORT, () => {
      console.log(
        `OffScripter API running on http://localhost:${env.PORT}`
      );

      console.log(
        `WebSocket running on ws://localhost:${env.PORT}/ws/transcription`
      );
    });

    let shuttingDown = false;

    const shutdown = (signal: string) => {
      if (shuttingDown) return;

      shuttingDown = true;

      console.log(
        `${signal} received. Shutting down...`
      );

      reminderTask.stop();
      emailOutboxTask.stop();

      // Close all active WebSocket connections.
      for (const client of wss.clients) {
        client.terminate();
      }

      wss.close();

      server.close(async () => {
        await prisma.$disconnect();

        console.log("Database disconnected");

        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      shutdown("SIGTERM");
    });

  } catch (error) {
    console.error("Failed to start server:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

void startServer();
