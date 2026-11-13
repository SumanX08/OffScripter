
import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { sendEmail } from "./email.service.js";

const MAX_ATTEMPTS = 5;

const sendProActivationEmail = async (
  recipient: string
) => {
  await sendEmail({
    to: recipient,
    subject: "Welcome to OffScripter Pro! 🚀",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: 30px auto;
        padding: 32px;
        color: #283618;
        background: #F8F1DC;
        border-radius: 12px;
      ">
        <h1>You're now an OffScripter Pro member! 🎉</h1>

        <p>
          Thank you for upgrading. Your Pro subscription is now active.
        </p>

        <p>
          Keep practising, sharpen your technical communication,
          and make every speaking attempt count.
        </p>

        <a
          href="https://offscripter.in/dashboard"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #283618;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          "
        >
          Go to OffScripter
        </a>

        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          Team OffScripter
        </p>
      </div>
    `,
  });
};

let isRunning = false;

export const startEmailOutboxWorker = () => {
  console.log("Email outbox worker started");

  // Recover jobs left processing after a previous server shutdown.
  void prisma.emailOutbox.updateMany({
    where: { status: "PROCESSING" },
    data: { status: "PENDING" },
  }).catch((error) => {
    console.error("Failed to recover email jobs:", error);
  });

  const task = cron.schedule("* * * * *", async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const jobs = await prisma.emailOutbox.findMany({
        where: {
          status: { in: ["PENDING", "FAILED"] },
          attempts: { lt: MAX_ATTEMPTS },
        },
        orderBy: { createdAt: "asc" },
        take: 10,
      });

      for (const job of jobs) {
        // Claim the job so another worker does not process it.
        const claimed = await prisma.emailOutbox.updateMany({
          where: {
            id: job.id,
            status: job.status,
            attempts: { lt: MAX_ATTEMPTS },
          },
          data: {
            status: "PROCESSING",
            attempts: { increment: 1 },
          },
        });

        if (claimed.count === 0) continue;

        try {
          if (job.type === "PRO_ACTIVATION") {
            await sendProActivationEmail(job.recipient);
          } else {
            throw new Error(`Unsupported email type: ${job.type}`);
          }

          await prisma.emailOutbox.update({
            where: { id: job.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
              lastError: null,
            },
          });

          console.log(`Outbox email sent: ${job.id}`);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown email error";

          await prisma.emailOutbox.update({
            where: { id: job.id },
            data: {
              status: "FAILED",
              lastError: message,
            },
          });

          console.error(`Outbox email failed: ${job.id}`, error);
        }
      }
    } catch (error) {
      console.error("Email outbox worker error:", error);
    } finally {
      isRunning = false;
    }
  });

  return task;
};
