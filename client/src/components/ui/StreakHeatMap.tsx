
import { Flame } from "lucide-react";
import type { StreakData } from "../../hooks/useStreak";

type StreakHeatmapProps = {
  streak: StreakData | null;
};

function getTodayInTimezone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

function getLevel(count: number) {
  if (count === 0) return "bg-[#e9edc9]";
  if (count === 1) return "bg-[#a3b18a]";
  if (count === 2) return "bg-[#606c38]";
  return "bg-[#283618]";
}

export default function StreakHeatmap({
  streak,
}: StreakHeatmapProps) {
  if (!streak) return null;

  const today = getTodayInTimezone(streak.timeZone);
  const startDate = addDays(today, -364);

  // Align the first date with Sunday so each column is a week.
  const startWeekday = new Date(
    `${startDate}T00:00:00Z`
  ).getUTCDay();

  const dates = Array.from(
    { length: startWeekday + 365 },
    (_, index) =>
      index < startWeekday
        ? null
        : addDays(startDate, index - startWeekday)
  );

  const totalAttempts = streak.totalCompletedAttempts ?? 0;
  const totalDays = streak.totalPracticeDays ?? 0;
  const activity = streak.dailyActivity ?? {};

  const monthLabels = dates
    .map((date, index) => {
      if (!date) return null;

      const currentMonth = date.slice(0, 7);
      const previousDate = dates[index - 1];
      const previousMonth = previousDate?.slice(0, 7);

      if (currentMonth !== previousMonth) {
        return {
          index,
          label: new Date(`${date}T00:00:00Z`).toLocaleDateString(
            "en-US",
            { month: "short", timeZone: "UTC" }
          ),
        };
      }

      return null;
    })
    .filter(
      (item): item is { index: number; label: string } =>
        item !== null
    );

  return (
    <section className=" border border-forest/15 bg-[#FFFDF0] p-5 mb-8 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-semibold text-forest">
            Practice consistency
          </p>
          <p className="mt-1 text-xs text-forest/50">
            Your speaking activity over the last year
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-soft px-3 py-2">
          <Flame size={18} className="text-rust" />
          <span className="text-sm font-bold text-forest">
            {streak.currentStreak} day streak
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-6">
        <div>
          <p className="text-2xl font-bold text-forest">
            {totalDays}
          </p>
          <p className="text-xs text-forest/50">
            Practice days
          </p>
        </div>

        <div>
          <p className="text-2xl font-bold text-forest">
            {totalAttempts}
          </p>
          <p className="text-xs text-forest/50">
            Completed attempts
          </p>
        </div>

        <div>
          <p className="text-2xl font-bold text-forest">
            {streak.longestStreak}
          </p>
          <p className="text-xs text-forest/50">
            Longest streak
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-3">
        <div className="min-w-[720px]">
          <div className="relative ml-8 mb-2 h-5">
            {monthLabels.map((month) => (
              <span
                key={`${month.label}-${month.index}`}
                className="absolute text-[10px] text-forest/50"
                style={{
                  left: `${(month.index / dates.length) * 100}%`,
                }}
              >
                {month.label}
              </span>
            ))}
          </div>

         <div className="flex gap-2">
  {/* Weekday labels */}
  <div className="grid shrink-0 grid-rows-[repeat(7,18px)] gap-[3px] text-[11px] text-olive/60">
    <div />
    <div className="flex items-center">Mon</div>
    <div />
    <div className="flex items-center">Wed</div>
    <div />
    <div className="flex items-center">Fri</div>
    <div />
  </div>

  {/* Heatmap */}
  <div className="grid grid-flow-col grid-rows-[repeat(7,18px)] auto-cols-4 gap-[3px]">
    {dates.map((date, index) => {
      if (!date) {
        return <div key={`empty-${index}`} />;
      }

      const count = activity[date] ?? 0;
      const isToday = date === today;

      return (
        <div
          key={date}
          title={`${date}: ${count} completed ${
            count === 1 ? "attempt" : "attempts"
          }`}
          aria-label={`${date}: ${count} completed attempts`}
          className={`size-4 rounded-[3px] ${getLevel(count)} ${
            isToday ? "ring-2 ring-rust ring-offset-1" : ""
          }`}
        />
      );
    })}
  </div>
</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-forest/50">
          Less
        </span>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={`size-3 rounded-[3px] ${getLevel(level)}`}
            />
          ))}
        </div>

        <span className="text-xs text-forest/50">
          More
        </span>
      </div>
    </section>
  );
}
