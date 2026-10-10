import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Menu,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/ui/Sidebar";
import { useAuthenticatedApi } from "../hooks/useAuthApi";
import type { Evaluation } from "../components/ui/ProgressSnapshot";

type Attempt = {
  id: string;
  createdAt: string;
  submittedAt: string | null;
  topic: {
    title: string;
    category: string;
    difficulty: string;
  };
  evaluation: Evaluation | null;
};

type HistoryResponse = {
  attempts: Attempt[];
  pagination: {
    total: number;
    totalPages: number;
  };
};

type ChartPoint = {
  attemptId: string;
  topic: string;
  date: string;
  score: number;
};

const metrics: {
  key: keyof Evaluation;
  label: string;
}[] = [
  { key: "technicalAccuracy", label: "Technical accuracy" },
  { key: "clarity", label: "Clarity" },
  { key: "structure", label: "Structure" },
  { key: "depth", label: "Technical depth" },
  { key: "examples", label: "Examples" },
  { key: "conciseness", label: "Conciseness" },
];

export default function Progress() {
  const api = useAuthenticatedApi();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setLoading(true);
      setError(false);

      try {
        const response = await api.get("/attempts/history", {
          params: { page: 1, limit: 10 },
        });

        if (cancelled) return;

        const data: HistoryResponse = response.data.data;

        setAttempts(data.attempts ?? []);
        setTotalAttempts(data.pagination?.total ?? 0);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load progress:", err);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [api]);

  // The API returns newest first. Reverse it so the chart reads left to right.
  const chartData: ChartPoint[] = [...attempts]
    .filter(
      (attempt): attempt is Attempt & {
        evaluation: Evaluation;
      } => attempt.evaluation !== null
    )
    .reverse()
    .map((attempt, index) => {
      const date = new Date(
        attempt.submittedAt ?? attempt.createdAt
      );

      return {
        attemptId: attempt.id,
        topic: attempt.topic.title,
        date: Number.isNaN(date.getTime())
          ? `Attempt ${index + 1}`
          : date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
        score: Math.round(attempt.evaluation.overallScore),
      };
    });

  const latestAttempt = attempts.find(
    (attempt) => attempt.evaluation !== null
  );

  const latestScore = latestAttempt?.evaluation?.overallScore;
  const previousScore =
    chartData.length >= 2
      ? chartData[chartData.length - 2].score
      : null;

  const scoreChange =
    latestScore !== undefined && previousScore !== null
      ? Math.round(latestScore) - previousScore
      : null;

  const evaluation = latestAttempt?.evaluation ?? null;

  const averageScore =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, point) => sum + point.score, 0) /
            chartData.length
        )
      : null;

  return (
    <div className="flex min-h-screen bg-[#FCF9EC] text-forest">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1">
        <div className="flex items-center border-b border-forest/10 px-5 py-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="grid size-10 place-items-center rounded-lg border border-forest/10"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <span className="ml-4 font-serif text-xl font-bold">
            OffScripter
          </span>
        </div>

        <div className="mx-auto max-w-295 px-5 py-10 md:px-8 lg:px-12 lg:py-14">
          <header className="mb-9">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-olive">
              Your growth
            </p>

            <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
              Progress
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-forest/60">
              Every attempt is a chance to become a clearer, more confident
              technical communicator.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-rust/30 bg-[#FBEEDC] p-4"
            >
              <p className="text-sm">
                Couldn't load your progress data.
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-bold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Summary cards */}
          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              icon={<Target size={20} />}
              label="Latest rating"
              value={
                loading
                  ? "—"
                  : latestScore !== undefined
                    ? `${Math.round(latestScore)}/100`
                    : "—"
              }
              description={
                scoreChange === null
                  ? "Complete another challenge to compare"
                  : scoreChange > 0
                    ? `${scoreChange} points above your previous attempt`
                    : scoreChange < 0
                      ? `${Math.abs(scoreChange)} points below your previous attempt`
                      : "Same as your previous attempt"
              }
              trend={scoreChange}
            />

            <SummaryCard
              icon={<TrendingUp size={20} />}
              label="Average rating"
              value={
                loading || averageScore === null
                  ? "—"
                  : `${averageScore}/100`
              }
              description="Across your latest 10 rated attempts"
            />

            <SummaryCard
              icon={<BarChart3 size={20} />}
              label="Challenges completed"
              value={loading ? "—" : String(totalAttempts)}
              description="All completed challenges"
            />
          </section>

          {/* Overall rating graph */}
          <section className="mb-8 border border-forest/15 bg-[#FFFDF0] p-5 md:p-8">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-rust">
                  Performance
                </p>

                <h2 className="font-serif text-2xl font-bold md:text-3xl">
                  Rating over time
                </h2>

                <p className="mt-2 text-sm text-forest/55">
                  Your overall evaluation score across recent attempts.
                </p>
              </div>

              <span className="border border-forest/10 bg-mist px-3 py-2 text-xs font-bold text-olive">
                Last 10 attempts
              </span>
            </div>

            {loading ? (
              <div className="grid h-70 place-items-center text-sm text-forest/50">
                Loading your rating history...
              </div>
            ) : chartData.length === 0 ? (
              <EmptyState
                onStart={() => navigate("/challenge")}
              />
            ) : (
              <div className="h-70 w-full md:h-85">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 12,
                      right: 16,
                      left: -12,
                      bottom: 4,
                    }}
                  >
                    <CartesianGrid
                      stroke="#283618"
                      strokeOpacity={0.09}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#606C38", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={16}
                    />

                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tick={{ fill: "#606C38", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      content={<ScoreTooltip />}
                      cursor={{
                        stroke: "#606C38",
                        strokeOpacity: 0.25,
                        strokeDasharray: "4 4",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#606C38"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#FEFAE0",
                        stroke: "#606C38",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#283618",
                        stroke: "#FEFAE0",
                        strokeWidth: 2,
                      }}
                      isAnimationActive
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {!loading && chartData.length > 0 && (
              <p className="mt-4 text-xs leading-5 text-forest/45">
                Showing {chartData.length} rated attempt
                {chartData.length === 1 ? "" : "s"}, from oldest to newest.
              </p>
            )}
          </section>

          {/* Latest evaluation */}
          <section className="border border-forest/15 bg-[#FFFDF0] p-5 md:p-8">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-rust">
                  Skill breakdown
                </p>

                <h2 className="font-serif text-2xl font-bold md:text-3xl">
                  Latest evaluation
                </h2>

                {latestAttempt && (
                  <p className="mt-2 text-sm text-forest/55">
                    {latestAttempt.topic.title}
                  </p>
                )}
              </div>

              {latestAttempt && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/challenge/${latestAttempt.id}/results`)
                  }
                  className="inline-flex items-center gap-2 text-sm font-bold text-olive hover:text-forest"
                >
                  View results <ArrowRight size={16} />
                </button>
              )}
            </div>

            {loading ? (
              <p className="py-8 text-sm text-forest/50">
                Loading evaluation...
              </p>
            ) : !evaluation ? (
              <p className="py-5 text-sm leading-6 text-forest/55">
                Your skill breakdown will appear after you complete your first
                evaluated challenge.
              </p>
            ) : (
              <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                {metrics.map(({ key, label }) => {
                  const score = evaluation[key];

                  if (typeof score !== "number") return null;

                  const safeScore = Math.max(0, Math.min(100, score));

                  return (
                    <div >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">
                          {label}
                        </span>
                        <span className="font-serif text-lg font-bold">
                          {score}
                          <span className="ml-1 text-xs font-normal text-forest/45">
                            /100
                          </span>
                        </span>
                      </div>

                      <div
                        className="h-2 overflow-hidden rounded-full bg-mist"
                        role="progressbar"
                        aria-label={label}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={safeScore}
                      >
                        <div
                          className="h-full rounded-full bg-olive transition-[width] duration-500"
                          style={{ width: `${safeScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  trend?: number | null;
}) {
  return (
    <article className="border border-forest/10 bg-[#FFFDF0] p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-forest/60">
          {label}
        </span>

        <span className="grid size-10 place-items-center rounded-full bg-sage/50 text-forest">
          {icon}
        </span>
      </div>

      <p className="font-serif text-4xl font-bold tracking-tight">
        {value}
      </p>

      <div className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-forest/55">
        {trend !== undefined && trend !== null && trend !== 0 ? (
          trend > 0 ? (
            <ArrowUpRight
              size={15}
              className="mt-0.5 shrink-0 text-olive"
            />
          ) : (
            <ArrowDownRight
              size={15}
              className="mt-0.5 shrink-0 text-rust"
            />
          )
        ) : null}

        <span>{description}</span>
      </div>
    </article>
  );
}

function ScoreTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: ChartPoint;
  }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="max-w-60 border border-forest/15 bg-mist p-4 shadow-lg">
      <p className="text-xs text-forest/55">{point.date}</p>
      <p className="mt-1 font-semibold text-forest">{point.topic}</p>
      <p className="mt-2 font-serif text-2xl font-bold text-olive">
        {point.score}
        <span className="ml-1 text-sm font-normal">/100</span>
      </p>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-65 flex-col items-center justify-center text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-sage/40 text-forest">
        <BarChart3 size={25} />
      </div>

      <h3 className="font-serif text-xl font-bold">
        Your progress starts here
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-forest/55">
        Complete a speaking challenge to create your first rating and start
        tracking your improvement.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-5 inline-flex items-center gap-2 bg-forest px-5 py-3 text-sm font-bold text-cream hover:bg-olive"
      >
        Start a challenge <ArrowRight size={16} />
      </button>
    </div>
  );
}