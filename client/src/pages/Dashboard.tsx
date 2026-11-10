
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Menu } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

import Button from "../components/ui/Button";
import DashboardStats from "../components/ui/DashboardStats";
import ProgressSnapshot from "../components/ui/ProgressSnapshot";
import RecentAttempt, {
  type RecentAttemptData,
} from "../components/ui/RecentAttempt";
import { useAuthenticatedApi } from "../hooks/useAuthApi";
import { useStreak } from "../hooks/useStreak";

type UserProfile = {
  username?: string;
};

type HistoryResponse = {
  attempts: RecentAttemptData[];
  pagination: {
    total: number;
  };
};

type DashboardData = {
  profile: UserProfile;
  attempts: RecentAttemptData[];
  challengesDone: number;
  totalPoints: number;
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const api = useAuthenticatedApi();
  const navigate = useNavigate();
  const { streak, loading: streakLoading } = useStreak();

  const [, setSidebarOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);

  // Fetch and cache dashboard data
  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.id],

    enabled: isLoaded && !!user?.id,

    queryFn: async (): Promise<DashboardData> => {
      const [profileResponse, historyResponse] =
        await Promise.all([
          api.get("/users/me"),
          api.get("/attempts/history", {
            params: { page: 1, limit: 10 },
          }),
        ]);

      const profile: UserProfile =
        profileResponse.data.data;

      const history: HistoryResponse =
        historyResponse.data.data;

      const completedAttempts = history.attempts ?? [];

      const totalPoints = completedAttempts.reduce(
        (sum, attempt) =>
          sum +
          Math.round(attempt.evaluation?.overallScore ?? 0),
        0
      );

      return {
        profile,
        attempts: completedAttempts,
        challengesDone: history.pagination?.total ?? 0,
        totalPoints,
      };
    },
  });

  // Extract cached data
  const profile = dashboardQuery.data?.profile ?? null;
  const attempts = dashboardQuery.data?.attempts ?? [];
  const challengesDone =
    dashboardQuery.data?.challengesDone ?? 0;
  const totalPoints = dashboardQuery.data?.totalPoints ?? 0;

  const loading =
    !isLoaded || dashboardQuery.isLoading;

  const loadError = dashboardQuery.isError;

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

        <motion.div
  className="mx-auto max-w-295 px-5 py-10 md:px-8 lg:px-12 lg:py-14"
  variants={pageVariants}
  initial="hidden"
  animate="visible"
>
          <motion.header variants={sectionVariants} className="mb-6">
            <h1 className="font-serif text-4xl tracking-tight text-forest">
              Good evening, {displayName}.
            </h1>

            <p className="mt-2 text-sm text-forest/55">
              Keep showing up. Every explanation makes you better.
            </p>
          </motion.header>

          {loadError && (
           
            <motion.div
  role="alert"
  variants={sectionVariants}
  className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-rust/30 bg-[#FBEEDC] p-4"
>

  <p className="text-sm text-forest">
                We couldn't load your latest statistics.
              </p>

              <button
                type="button"
                onClick={() => dashboardQuery.refetch()}
                className="text-sm font-bold text-forest underline"
              >
                Try again
              </button>

  </motion.div>
          )}

          <motion.div variants={sectionVariants}>

          <DashboardStats
            totalPoints={totalPoints}
            dayStreak={streak?.currentStreak ?? 0}
            challengesDone={challengesDone}
            loading={loading || streakLoading}
          />

          </motion.div>

          <motion.section
  variants={sectionVariants}
  whileHover={{ y: -3 }}
  transition={{ duration: 0.25 }}
  className="mb-8 overflow-hidden rounded-2xl border border-forest bg-forest shadow-[5px_5px_0_var(--color-amber)]"
>
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
         </motion.section>

          <motion.section
  variants={sectionVariants}
  className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"
>
  <motion.div variants={sectionVariants}>
    <ProgressSnapshot
      evaluation={latestAttempt?.evaluation ?? null}
      loading={loading}
      onViewProgress={() => navigate("/progress")}
    />
  </motion.div>

  <motion.div variants={sectionVariants}>
    <RecentAttempt
      attempt={latestAttempt}
      loading={loading}
      onViewResults={(id) =>
        navigate(`/challenge/${id}/results`)
      }
      onViewAll={() => navigate("/history")}
    />
  </motion.div>
</motion.section>
        </motion.div>
      </main>
    </div>
  );
}
