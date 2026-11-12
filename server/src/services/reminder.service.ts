
import cron from "node-cron";
import { DateTime } from "luxon";

import { prisma } from "../config/prisma.js";
import { sendEmail } from "./email.service.js";

type ReminderType = "DAILY_PRACTICE" | "STREAK";

type ReminderUser = {
  id: string;
  email: string;
  username: string;
  timezone: string;
  reminderTime: string;
  dailyReminderEnabled: boolean;
  streakReminderEnabled: boolean;
};

// Check whether the user has completed a practice today.
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

// Calculate the user's current consecutive-day streak.
// The user must have practised yesterday to have an active
// streak when they have not practised today.
const getActiveStreak = async (
  userId: string,
  timezone: string
): Promise<number> => {
  const now = DateTime.now().setZone(timezone);

  if (!now.isValid) return 0;

  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      status: "COMPLETED",
      submittedAt: {
        gte: now
          .startOf("day")
          .minus({ days: 365 })
          .toUTC()
          .toJSDate(),
        lt: now
          .plus({ days: 1 })
          .startOf("day")
          .toUTC()
          .toJSDate(),
      },
    },
    select: {
      submittedAt: true,
    },
  });

  const practiceDates = new Set(
    attempts
      .filter((attempt) => attempt.submittedAt !== null)
      .map((attempt) =>
        DateTime.fromJSDate(attempt.submittedAt!)
          .setZone(timezone)
          .toISODate()
      )
  );

  let streak = 0;

  for (let daysAgo = 1; daysAgo <= 365; daysAgo++) {
    const date = now.minus({ days: daysAgo }).toISODate();

    if (!date || !practiceDates.has(date)) {
      break;
    }

    streak++;
  }

  return streak;
};

// Send a reminder and prevent duplicate emails.
const sendReminder = async (
  user: ReminderUser,
  type: ReminderType,
  localDate: string,
  streak = 0
): Promise<void> => {
  // Create a log first. The unique constraint prevents
  // multiple scheduler executions from sending duplicates.
  try {
    await prisma.reminderLog.create({
      data: {
        userId: user.id,
        type,
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
    const isStreakReminder = type === "STREAK";

    const subject = isStreakReminder
      ? `Your ${streak}-day OffScripter streak is at risk! 🔥`
      : "Time for your daily speaking practice!";

    const content = isStreakReminder
      ? `
          <h2>Your ${streak}-day streak is waiting for you 🔥</h2>
          <p>You haven't completed today's speaking challenge yet.</p>
          <p>Take a few minutes to practise and keep your streak alive!</p>
        `
      : `
          <h2>Ready for today's speaking challenge?</h2>
          <p>Consistency is the key to becoming a better communicator.</p>
          <p>Pick a topic, research it and practise speaking for two minutes.</p>
        `;

    await sendEmail({
      to: user.email,
      subject,
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

          ${content}

          <a
            href="https://offscripter.in"
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
            You're receiving this because you enabled reminders
            in your OffScripter account.
          </p>
        </div>
      `,
    });

    console.log(
      `${type} reminder sent to ${user.email}`
    );
  } catch (error) {
    // Remove the log if sending failed, allowing a retry.
    await prisma.reminderLog.deleteMany({
      where: {
        userId: user.id,
        type,
        localDate,
      },
    });

    throw error;
  }
};

// Prevent overlapping scheduler executions.
let isRunning = false;

export const startReminderScheduler = () => {
  console.log("OffScripter reminder scheduler started");

  const task = cron.schedule("* * * * *", async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { dailyReminderEnabled: true },
            { streakReminderEnabled: true },
          ],
        },
        select: {
          id: true,
          email: true,
          username: true,
          timezone: true,
          reminderTime: true,
          dailyReminderEnabled: true,
          streakReminderEnabled: true,
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

          // Only run at the user's selected reminder time.
          if (localNow.toFormat("HH:mm") !== user.reminderTime) {
            continue;
          }

          const localDate = localNow.toISODate();

          if (!localDate) continue;

          // Never remind someone who already practised today.
          const practicedToday = await hasPractisedToday(
            user.id,
            user.timezone
          );

          if (practicedToday) continue;

          // Prioritize streak reminders over daily reminders.
          if (user.streakReminderEnabled) {
            const streak = await getActiveStreak(
              user.id,
              user.timezone
            );

            if (streak > 0) {
              await sendReminder(
                user,
                "STREAK",
                localDate,
                streak
              );

              continue;
            }
          }

          if (user.dailyReminderEnabled) {
            await sendReminder(
              user,
              "DAILY_PRACTICE",
              localDate
            );
          }
        } catch (error) {
          console.error(
            `Reminder failed for ${user.email}:`,
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
