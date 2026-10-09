import { useEffect, useState } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/ui/Sidebar";
import Button from "../components/ui/Button";
import DashboardStats from "../components/ui/DashboardStats";
import ProgressSnapshot from "../components/ui/ProgressSnapshot";
import RecentAttempt, {
  type RecentAttemptData,
} from "../components/ui/RecentAttempt";
import { useAuthenticatedApi } from "../hooks/useAuthApi";

type UserProfile = {
  username?: string;
};

type HistoryResponse = {
  attempts: RecentAttemptData[];
  pagination: {
    total: number;
  };
};

export default function Dashboard() {
  const { user } = useUser();
  const api = useAuthenticatedApi();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<RecentAttemptData[]>([]);
  const [challengesDone, setChallengesDone] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setLoadError(false);

      try {
        const [profileResponse, historyResponse] = await Promise.all([
          api.get("/users/me"),
          api.get("/attempts/history", {
            params: { page: 1, limit: 10 },
          }),
        ]);

        if (cancelled) return;

        const history: HistoryResponse = historyResponse.data.data;
        const completedAttempts = history.attempts ?? [];

        setProfile(profileResponse.data.data);
        setAttempts(completedAttempts);
        setChallengesDone(history.pagination?.total ?? 0);

        // Temporary MVP calculation: points from the latest 10 attempts.
        // Replace with a lifetime aggregate API when we add reusable stats.
        setTotalPoints(
          completedAttempts.reduce(
            (sum, attempt) =>
              sum +
              Math.round(attempt.evaluation?.overallScore ?? 0),
            0
          )
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load dashboard:", error);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [api]);

  const latestAttempt = attempts[0] ?? null;
  const displayName =
    profile?.username ||
    user?.firstName ||
    user?.username ||
    "there";

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    navigate("/challenge");
  };

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

        <div className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 lg:px-12 lg:py-14">
          <header className="mb-6">
            <h1 className="font-serif text-4xl tracking-tight text-forest">
              Good evening, {displayName}.
            </h1>
            <p className="mt-2 text-sm text-forest/55">
              Keep showing up. Every explanation makes you better.
            </p>
          </header>

          {loadError && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-rust/30 bg-[#FBEEDC] p-4"
            >
              <p className="text-sm text-forest">
                We couldn't load your latest statistics.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-bold text-forest underline"
              >
                Try again
              </button>
            </div>
          )}

          <DashboardStats
            totalPoints={totalPoints}
            dayStreak={null}
            challengesDone={challengesDone}
            loading={loading}
          />

          <section className="mb-8 overflow-hidden rounded-2xl border border-forest bg-forest shadow-[5px_5px_0_var(--color-amber)]">
            <div className="flex min-h-40 items-center justify-between gap-6 px-7 py-7">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cream/70">
                  Today's challenge
                </p>
                <h2 className="max-w-3xl font-serif text-3xl font-bold leading-tight text-cream md:text-4xl">
                  Spin for a topic
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-cream/60">
                  Let chance choose your next technical challenge.
                </p>
              </div>

              <Button
                onClick={handleSpin}
                disabled={spinning}
                className="shrink-0 bg-rust text-white hover:bg-rust/90"
              >
                Spin for a Topic
                <ArrowRight size={17} />
              </Button>
            </div>
          </section>

          <section className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            <ProgressSnapshot
              evaluation={latestAttempt?.evaluation ?? null}
              loading={loading}
              onViewProgress={() => navigate("/progress")}
            />

            <RecentAttempt
              attempt={latestAttempt}
              loading={loading}
              onViewResults={(id) =>
                navigate(`/challenge/${id}/results`)
              }
              onViewAll={() => navigate("/history")}
            />
          </section>
        </div>
      </main>
    </div>
  );
}