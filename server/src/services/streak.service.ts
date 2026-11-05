
import { prisma } from "../config/prisma.js";

const TIME_ZONE = "Asia/Kolkata";
const HISTORY_DAYS = 365;

function getDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateKey: string, amount: number): string {
  const parts = dateKey.split("-");

  if (parts.length !== 3) {
    throw new Error(`Invalid date: ${dateKey}`);
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error(`Invalid date: ${dateKey}`);
  }

  const date = new Date(
    Date.UTC(year, month - 1, day + amount)
  );

  return date.toISOString().slice(0, 10);
}

export async function getUserStreak(userId: string) {
  const today = getDateKey(new Date());
  const historyStart = addDays(today, -(HISTORY_DAYS - 1));

  // Fetch completed speaking attempts only.
  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      status: "COMPLETED",
      stage: "SUBMITTED",
      submittedAt: {
        not: null,
      },
    },
    select: {
      submittedAt: true,
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  // Convert timestamps into calendar dates in IST.
  // Multiple attempts on one day count as one practice day.
  const practiceDates = [
    ...new Set(
      attempts
        .map((attempt) => attempt.submittedAt)
        .filter((date): date is Date => date !== null)
        .map(getDateKey)
    ),
  ].sort();

  const practicedToday = practiceDates.includes(today);

  const lastPracticeDate =
    practiceDates.length > 0
      ? practiceDates[practiceDates.length - 1]
      : null;

  // Calculate the longest streak from all historical practice dates.
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;

  for (const date of practiceDates) {
    if (
      previousDate &&
      addDays(previousDate, 1) === date
    ) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(
      longestStreak,
      runningStreak
    );

    previousDate = date;
  }

  // Current streak is alive if the last practice was today
  // or yesterday.
  let currentStreak = 0;

  if (
    lastPracticeDate === today ||
    lastPracticeDate === addDays(today, -1)
  ) {
    currentStreak = 1;

    let expectedDate = addDays(lastPracticeDate!, -1);

    for (
      let i = practiceDates.length - 2;
      i >= 0;
      i--
    ) {
      if (practiceDates[i] !== expectedDate) {
        break;
      }

      currentStreak += 1;
      expectedDate = addDays(expectedDate, -1);
    }
  }

  // Only return the latest 365 calendar days for the heatmap.
  const recentPracticeDates = practiceDates.filter(
    (date) => date >= historyStart && date <= today
  );

  // Count completed attempts per calendar day (IST).
const dailyActivity: Record<string, number> = {};

for (const attempt of attempts) {
  if (!attempt.submittedAt) continue;

  const dateKey = getDateKey(attempt.submittedAt);

  if (dateKey >= historyStart && dateKey <= today) {
    dailyActivity[dateKey] = (dailyActivity[dateKey] ?? 0) + 1;
  }
}

  return {
  currentStreak,
  longestStreak,
  practicedToday,
  lastPracticeDate,
  practiceDates: recentPracticeDates,
  totalPracticeDays: practiceDates.length,
  totalCompletedAttempts: attempts.length,
  dailyActivity,
  timeZone: TIME_ZONE,
  historyDays: HISTORY_DAYS,
};
}
