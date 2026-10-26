
import { prisma } from "../config/prisma.js";

const TIME_ZONE = "Asia/Kolkata";

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

// Date keys are YYYY-MM-DD, so UTC arithmetic gives reliable
// calendar-day differences without DST complications.
function addDays(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day + amount)
  );

  return date.toISOString().slice(0, 10);
}

export async function getUserStreak(userId: string) {
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

  const today = getDateKey(new Date());

  // Multiple completed attempts on one day count as one practice day.
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

  // Calculate the longest streak across all recorded practice days.
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;

  for (const date of practiceDates) {
    if (previousDate && addDays(previousDate, 1) === date) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    previousDate = date;
  }

  // The current streak remains alive if the user practiced today
  // or yesterday. Otherwise it is zero until they practice again.
  let currentStreak = 0;

  if (
    lastPracticeDate === today ||
    lastPracticeDate === addDays(today, -1)
  ) {
    currentStreak = 1;
    let expectedDate = addDays(lastPracticeDate!, -1);

    for (let i = practiceDates.length - 2; i >= 0; i--) {
      if (practiceDates[i] !== expectedDate) {
        break;
      }

      currentStreak += 1;
      expectedDate = addDays(expectedDate, -1);
    }
  }

  const recentPracticeDates = practiceDates.filter(
    (date) => date >= addDays(today, -29) && date <= today
  );

  return {
    currentStreak,
    longestStreak,
    practicedToday,
    lastPracticeDate,
    practiceDates: recentPracticeDates,
    timeZone: TIME_ZONE,
  };
}
