import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("Database connected");

    const server = app.listen(
      env.PORT,
      () => {
        console.log(
          `OffScripter API running on http://localhost:${env.PORT}`
        );
      }
    );

    const shutdown = async (
      signal: string
    ) => {
      console.log(
        `${signal} received. Shutting down...`
      );

      server.close(async () => {
        await prisma.$disconnect();

        console.log(
          "Database disconnected"
        );

        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    await prisma.$disconnect();

    process.exit(1);
  }
};

void startServer();