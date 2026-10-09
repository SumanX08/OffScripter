import {
  CheckCircle2,
  Flame,
  Star,
} from "lucide-react";

type DashboardStatsProps = {
  totalPoints: number;
  dayStreak: number | null;
  challengesDone: number;
  loading?: boolean;
};

function StatCard({
  icon,
  value,
  label,
  change,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  change?: string;
}) {
  return (
    <div className="border border-forest/10 bg-cream p-6">
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage/50 text-forest">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-forest/60">
            {label}
          </p>

          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <p className="font-serif text-4xl font-bold leading-none text-forest">
              {value}
            </p>

            {change && (
              <span className="text-xs font-semibold text-olive">
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats({
  totalPoints,
  dayStreak,
  challengesDone,
  loading = false,
}: DashboardStatsProps) {
  return (
    <section
      aria-label="Your statistics"
      className="mb-8 grid gap-4 md:grid-cols-3"
    >
      <StatCard
        icon={<Star size={19} />}
        value={loading ? "—" : totalPoints.toLocaleString()}
        label="Total Points"
      />

      <StatCard
        icon={<Flame size={19} />}
        value={loading ? "—" : dayStreak === null ? "—" : String(dayStreak)}
        label="Day Streak"
        change={dayStreak === null && !loading ? "Coming soon" : undefined}
      />

      <StatCard
        icon={<CheckCircle2 size={19} />}
        value={loading ? "—" : challengesDone.toLocaleString()}
        label="Challenges Done"
      />
    </section>
  );
}