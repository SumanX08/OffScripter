import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  
  History as HistoryIcon,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/ui/Sidebar";
import { useAuthenticatedApi } from "../hooks/useAuthApi";

type Evaluation = {
  overallScore: number;
};

type Topic = {
  title: string;
  category: string;
  difficulty: string;
  speakingTime: number;
};

type Attempt = {
  id: string;
  createdAt: string;
  status: string;
  topic: Topic;
  evaluation: Evaluation | null;
};

type HistoryResponse = {
  attempts: Attempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getScoreStyle(score: number) {
  if (score >= 80) {
    return "bg-sage/60 text-forest";
  }

  if (score >= 60) {
    return "bg-amber/20 text-forest";
  }

  return "bg-rust/10 text-rust";
}

export default function History() {
  const api = useAuthenticatedApi();
  const navigate = useNavigate();

  const [history, setHistory] =
    useState<HistoryResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);


  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/attempts/history?page=${page}&limit=10`
        );

        setHistory(response.data.data);
      } catch (error) {
        console.error("Failed to load history:", error);
        setError("Unable to load your history.");
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, [api, page]);

  return (

    <div className="flex min-h-screen bg-[#FCF9EC] text-forest">

 <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
    
    <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">

       
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sage/50 text-olive">
              <HistoryIcon size={21} />
            </div>

            <span className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-olive">
              Your journey
            </span>
          </div>

          <h1 className="font-serif text-4xl text-forest sm:text-5xl">
            History
          </h1>

          <p className="mt-2 max-w-xl font-sans text-sm leading-6 text-forest/55 sm:text-base">
            Look back at your previous speaking challenges
            and see how you're improving.
          </p>
        </header>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-forest/10 bg-[#FFFDF4] p-10">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-5 h-10 w-10 animate-spin rounded-full border-4 border-mist border-t-olive" />

              <h2 className="font-serif text-2xl text-forest">
                Loading your history...
              </h2>

              <p className="mt-2 font-sans text-sm text-forest/50">
                Getting your previous challenges.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-rust/20 bg-rust/5 p-8 text-center">
            <h2 className="font-serif text-2xl text-forest">
              Something went wrong
            </h2>

            <p className="mt-2 font-sans text-sm text-forest/60">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setPage(1)}
              className="mt-5 rounded-xl bg-forest px-5 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-olive"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          history &&
          history.attempts.length === 0 && (
            <div className="rounded-2xl border border-forest/10 bg-[#FFFDF4] px-6 py-16 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-mist text-olive">
                <HistoryIcon size={28} />
              </div>

              <h2 className="mt-6 font-serif text-3xl text-forest">
                No challenges yet
              </h2>

              <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-6 text-forest/55">
                Complete your first speaking challenge and
                your results will appear here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/challenge")}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-olive"
              >
                Start a Challenge
                <ArrowRight size={17} />
              </button>
            </div>
          )}

        {/* History */}
        {!loading &&
          !error &&
          history &&
          history.attempts.length > 0 && (
            <>
              {/* Summary */}
              <div className="mb-5 grid gap-4 sm:grid-cols-3">
                <div className="border border-forest/10 bg-[#FFFDF4] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-sage/50 text-olive">
                      <Trophy size={19} />
                    </div>

                    <div>
                      <p className="font-sans text-xs text-forest/50">
                        Challenges completed
                      </p>

                      <p className="mt-0.5 font-serif text-2xl text-forest">
                        {history.pagination.total}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-forest/10 bg-[#FFFDF4] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-sage/50 text-olive">
                      <Trophy size={19} />
                    </div>

                    <div>
                      <p className="font-sans text-xs text-forest/50">
                        Average score
                      </p>

                      <p className="mt-0.5 font-serif text-2xl text-forest">
                        {getAverageScore(history.attempts)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-forest/10 bg-[#FFFDF4] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-sage/50 text-olive">
                      <HistoryIcon size={19} />
                    </div>

                    <div>
                      <p className="font-sans text-xs text-forest/50">
                        Showing
                      </p>

                      <p className="mt-0.5 font-serif text-2xl text-forest">
                        {history.attempts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* List */}
              <section className="overflow-hidden rounded-2xl border border-forest/10 bg-[#FFFDF4]">
                <div className="border-b border-forest/10 px-5 py-5 sm:px-7">
                  <h2 className="font-serif text-2xl text-forest">
                    Previous challenges
                  </h2>

                  <p className="mt-1 font-sans text-xs text-forest/50">
                    Your latest speaking attempts.
                  </p>
                </div>

                <div>
                  {history.attempts.map((attempt) => {
                    const score =
                      attempt.evaluation?.overallScore ?? 0;

                    return (
                      <button
                        key={attempt.id}
                        type="button"
                        onClick={() =>
                          navigate(
                            `/challenge/${attempt.id}/results`
                          )
                        }
                        className="group flex w-full flex-col gap-5 border-b border-forest/10 px-5 py-5 text-left transition last:border-b-0 hover:bg-forest/[0.025] sm:flex-row sm:items-center sm:px-7"
                      >
                        {/* Icon */}
                        <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-mist text-olive sm:flex">
                          <HistoryIcon size={20} />
                        </div>

                        {/* Main */}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-xl leading-tight text-forest transition group-hover:text-olive">
                            {attempt.topic.title}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-xs text-forest/50">
                            <span className="capitalize">
                              {attempt.topic.category}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-forest/20" />

                            <span className="capitalize">
                              {attempt.topic.difficulty}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-forest/20" />

                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={13} />
                              {formatDate(attempt.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                          <div className="text-left sm:text-right">
                            <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-forest/40">
                              Score
                            </span>

                            <div className="mt-1">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 font-sans text-sm font-bold ${getScoreStyle(
                                  score
                                )}`}
                              >
                                {Math.round(score)}
                                <span className="ml-0.5 font-normal">
                                  /100
                                </span>
                              </span>
                            </div>
                          </div>

                          <ArrowRight
                            size={19}
                            className="text-forest/30 transition-transform group-hover:translate-x-1 group-hover:text-olive"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Pagination */}
              {history.pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={
                      !history.pagination.hasPreviousPage
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-forest/10 bg-[#FFFDF4] px-4 py-2.5 font-sans text-sm font-semibold text-forest transition hover:bg-forest/5 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <span className="font-sans text-xs text-forest/50">
                    Page {history.pagination.page} of{" "}
                    {history.pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      !history.pagination.hasNextPage
                    }
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-forest/10 bg-[#FFFDF4] px-4 py-2.5 font-sans text-sm font-semibold text-forest transition hover:bg-forest/5 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </main>

    </div>
  );
}

function getAverageScore(attempts: Attempt[]) {
  const scoredAttempts = attempts.filter(
    (attempt) => attempt.evaluation
  );

  if (scoredAttempts.length === 0) {
    return "—";
  }

  const total = scoredAttempts.reduce(
    (sum, attempt) =>
      sum + (attempt.evaluation?.overallScore ?? 0),
    0
  );

  return Math.round(total / scoredAttempts.length);
}