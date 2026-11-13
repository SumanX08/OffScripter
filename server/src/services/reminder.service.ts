
import cron from "node-cron";
import { DateTime } from "luxon";

import { prisma } from "../config/prisma.js";
import { sendEmail } from "./email.service.js";

type ReminderUser = {
  id: string;
  email: string;
  username: string;
  timezone: string;
  reminderTime: string;
};

const hasPractisedToday = async (
  userId: string,
  timezone: string
): Promise<boolean> => {
  const now = DateTime.now().setZone(timezone);

  if (!now.isValid) return false;

  const startOfDay = now.startOf("day").toUTC().toJSDate();
  const startOfTomorrow = now
    .plus({ days: 1 })
    .startOf("day")
    .toUTC()
    .toJSDate();

  const count = await prisma.attempt.count({
    where: {
      userId,
      status: "COMPLETED",
      submittedAt: {
        gte: startOfDay,
        lt: startOfTomorrow,
      },
    },
  });

  return count > 0;
};

const sendDailyReminder = async (
  user: ReminderUser,
  localDate: string
): Promise<void> => {
  try {
    await prisma.reminderLog.create({
      data: {
        userId: user.id,
        type: "DAILY_PRACTICE",
        localDate,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return;
    }

    throw error;
  }

  try {
    await sendEmail({
      to: user.email,
      subject: "Time for your daily speaking practice!",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 560px;
          margin: 30px auto;
          padding: 30px;
          color: #283618;
          background: #F8F1DC;
          border-radius: 12px;
        ">
          <h1>Hey ${user.username}!</h1>

          <h2>Ready for today's speaking challenge?</h2>

          <p>
            Consistency is the key to becoming a better communicator.
          </p>

          <p>
            Pick a topic, research it and practise speaking for two minutes.
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
            Start practising
          </a>

          <p style="
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          ">
            You're receiving this because you enabled daily
            practice reminders in your OffScripter account.
          </p>
        </div>
      `,
    });

    console.log(`Daily reminder sent to ${user.email}`);
  } catch (error) {
    await prisma.reminderLog.deleteMany({
      where: {
        userId: user.id,
        type: "DAILY_PRACTICE",
        localDate,
      },
    });

    throw error;
  }
};

let isRunning = false;

export const startReminderScheduler = () => {
  console.log("OffScripter reminder scheduler started");

  const task = cron.schedule("* * * * *", async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const users = await prisma.user.findMany({
        where: {
          dailyReminderEnabled: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          timezone: true,
          reminderTime: true,
        },
      });

      const utcNow = DateTime.utc();

      for (const user of users) {
        try {
          const localNow = utcNow.setZone(user.timezone);

          if (!localNow.isValid) {
            console.error(
              `Invalid timezone for user ${user.id}: ${user.timezone}`
            );
            continue;
          }

          if (localNow.toFormat("HH:mm") !== user.reminderTime) {
            continue;
          }

          const localDate = localNow.toISODate();

          if (!localDate) continue;

          const practicedToday = await hasPractisedToday(
            user.id,
            user.timezone
          );

          if (practicedToday) continue;

          await sendDailyReminder(user, localDate);
        } catch (error) {
          console.error(
            `Daily reminder failed for ${user.email}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error);
    } finally {
      isRunning = false;
    }
  });

  return task;
};
