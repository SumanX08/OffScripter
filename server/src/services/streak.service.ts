
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
  const [year, month, day] = dateKey.split("-").map(Number);

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

  return {
    currentStreak,
    longestStreak,
    practicedToday,
    lastPracticeDate,
    practiceDates: recentPracticeDates,
    totalPracticeDays: practiceDates.length,
    timeZone: TIME_ZONE,
    historyDays: HISTORY_DAYS,
  };
}
