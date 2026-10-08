import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuthenticatedApi } from "../hooks/useAuthApi";

type AttemptStage =
  | "RESEARCHING"
  | "SPEAKING"
  | "SUBMITTED";

type AttemptResponse = {
  id: string;

  status:
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ABANDONED";

  stage: AttemptStage;

  startedAt: string;
  researchEndedAt: string | null;
  speakingStartedAt: string | null;

  topic: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    researchTime: number;
    speakingTime: number;
  };
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(remainingSeconds).padStart(
    2,
    "0",
  )}`;
}

export default function Research() {
  const { attemptId } =
    useParams<{ attemptId: string }>();

  const api = useAuthenticatedApi();

  const navigate = useNavigate();

  const [attempt, setAttempt] =
    useState<AttemptResponse | null>(null);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [paused, setPaused] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [finishing, setFinishing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [timerEndAt, setTimerEndAt] =
    useState<number | null>(null);

  const [pausedTime, setPausedTime] =
    useState(0);

  /*
   * --------------------------------------------------
   * Load attempt
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!attemptId) {
      setError("Challenge not found.");
      setLoading(false);
      return;
    }

    const loadAttempt = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/attempts/${attemptId}`,
        );

        const data: AttemptResponse =
          response.data.data;

        if (!data) {
          throw new Error(
            "Challenge not found.",
          );
        }

        /*
         * If research has already finished,
         * continue directly to speaking.
         */
        if (data.stage === "SPEAKING") {
          navigate(
            `/challenge/${attemptId}/speaking`,
            {
              replace: true,
            },
          );

          return;
        }

        /*
         * If already submitted,
         * return to dashboard.
         */
        if (data.stage === "SUBMITTED") {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }

        setAttempt(data);

        /*
         * Start the research timer.
         */
        const startedAt = new Date(
          data.startedAt,
        ).getTime();

        const endAt =
          startedAt +
          data.topic.researchTime * 1000;

        const remaining = Math.max(
          0,
          Math.ceil(
            (endAt - Date.now()) / 1000,
          ),
        );

        setTimerEndAt(endAt);
        setTimeLeft(remaining);
      } catch (error) {
        console.error(
          "Failed to load attempt:",
          error,
        );

        setError(
          "We couldn't load this challenge.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAttempt();
  }, [
    api,
    attemptId,
    navigate,
  ]);

  /*
   * --------------------------------------------------
   * Countdown
   * --------------------------------------------------
   */

  useEffect(() => {
    if (
      timerEndAt === null ||
      paused ||
      finishing
    ) {
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (timerEndAt - Date.now()) /
            1000,
        ),
      );

      setTimeLeft(remaining);
    };

    updateTimer();

    const interval =
      window.setInterval(
        updateTimer,
        250,
      );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    timerEndAt,
    paused,
    finishing,
  ]);

  /*
   * --------------------------------------------------
   * Finish research automatically
   * --------------------------------------------------
   */

  useEffect(() => {
    if (
      timeLeft !== 0 ||
      !attempt ||
      finishing ||
      paused
    ) {
      return;
    }

    void finishResearch();
  }, [
    timeLeft,
    attempt,
    finishing,
    paused,
  ]);

  /*
   * --------------------------------------------------
   * Finish research
   * --------------------------------------------------
   */

  const finishResearch = async () => {
    if (
      !attemptId ||
      finishing
    ) {
      return;
    }

    try {
      setFinishing(true);
      setError("");

      await api.patch(
        `/attempts/${attemptId}/research/complete`,
      );

      navigate(
        `/challenge/${attemptId}/speaking`,
      );
    } catch (error) {
      console.error(
        "Failed to finish research:",
        error,
      );

      setError(
        "We couldn't start the speaking stage. Please try again.",
      );

      setFinishing(false);
    }
  };

  /*
   * --------------------------------------------------
   * Pause / Resume
   * --------------------------------------------------
   */

  const handlePauseToggle = () => {
    if (
      finishing ||
      timeLeft <= 0
    ) {
      return;
    }

    if (!paused) {
      setPausedTime(timeLeft);
      setPaused(true);

      return;
    }

    const newEndAt =
      Date.now() +
      pausedTime * 1000;

    setTimerEndAt(newEndAt);
    setPaused(false);
  };

  /*
   * --------------------------------------------------
   * Reset
   * --------------------------------------------------
   */

  const handleReset = () => {
    if (
      !attempt ||
      finishing
    ) {
      return;
    }

    const duration =
      attempt.topic.researchTime;

    const newEndAt =
      Date.now() +
      duration * 1000;

    setTimerEndAt(newEndAt);
    setTimeLeft(duration);
    setPausedTime(0);
    setPaused(false);
    setError("");
  };

  const researchDuration =
    attempt?.topic.researchTime ?? 1;

  const progress = useMemo(() => {
    if (!attempt) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        ((researchDuration -
          timeLeft) /
          researchDuration) *
          100,
      ),
    );
  }, [
    attempt,
    researchDuration,
    timeLeft,
  ]);

  /*
   * --------------------------------------------------
   * Loading
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FCF9EC]">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#263911]/50">
          Loading challenge...
        </p>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * Error / missing attempt
   * --------------------------------------------------
   */

  if (!attempt) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FCF9EC] px-6">
        <div className="max-w-md text-center">
          <p className="font-serif text-3xl text-[#263911]">
            Challenge unavailable.
          </p>

          <p className="mt-3 text-sm leading-6 text-[#263911]/50">
            {error ||
              "We couldn't find this challenge."}
          </p>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * Research screen
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#FCF9EC] text-[#263911]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1000px] flex-col px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-12">

        {/* -------------------------------------------
            TOPIC
        ------------------------------------------- */}

        <section className="text-center">
          

          <h1 className="mx-auto mt-3 max-w-[850px] font-serif text-4xl leading-[1.04] tracking-[-0.04em] text-green sm:text-[45px] lg:text-[58px]">
            {attempt.topic.title}
          </h1>
        </section>

        {/* -------------------------------------------
            TIMER
        ------------------------------------------- */}

        <section className="text-center mt-6">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#263911]/55">
            Research time
          </p>

          <div
            className={[
              "mt-2 font-serif text-[92px] leading-none tracking-[-0.065em]",
              "sm:text-[112px]",
              "lg:text-[70px]",
              timeLeft <= 10
                ? "text-[#BF681C]"
                : "text-[#263911]",
            ].join(" ")}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}

          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={
                handlePauseToggle
              }
              disabled={
                timeLeft === 0 ||
                finishing
              }
              className="inline-flex h-12 min-w-[156px] items-center justify-center gap-3 rounded-xl bg-[#E8EDC7] px-6 text-[15px] font-medium text-[#263911] transition hover:bg-[#E0E7B8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {paused ? (
                <Play size={17} />
              ) : (
                <Pause size={17} />
              )}

              {paused
                ? "Resume"
                : "Pause"}
            </button>

            <button
              type="button"
              onClick={
                handleReset
              }
              disabled={finishing}
              className="inline-flex h-12 min-w-[136px] items-center justify-center gap-3 rounded-xl bg-[#E8EDC7] px-6 text-[15px] font-medium text-[#263911] transition hover:bg-[#E0E7B8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw
                size={17}
              />

              Reset
            </button>
          </div>
        </section>

        {/* -------------------------------------------
            NOTES
        ------------------------------------------- */}

        <section className="mx-auto mt-8 w-full max-w-[560px] ">
          <label
            htmlFor="research-notes"
            className="block text-[15px] font-medium text-[#263911]/75"
          >
            What do you want to
            remember?
          </label>

          <textarea
            id="research-notes"
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            className="mt-3 min-h-[182px] w-full resize-none rounded-2xl border border-[#263911]/15 bg-[#F8EDCE] px-5 py-5 text-[15px] leading-7 text-[#263911] outline-none transition placeholder:text-[#263911]/30 focus:border-[#263911]/30 focus:ring-2 focus:ring-[#263911]/5"
            placeholder="Jot down key points, concepts, examples..."
            spellCheck
          />
        </section>

        {/* -------------------------------------------
            START SPEAKING
        ------------------------------------------- */}

        <section className="mt-4 flex justify-center pb-4">
          <button
            type="button"
            onClick={() =>
              void finishResearch()
            }
            disabled={finishing}
            className="inline-flex h-14 mt-3 min-w-[252px] items-center justify-center gap-4 rounded-xl bg-[#263911] px-8 text-[16px] font-semibold text-[#FCF9EC] shadow-[0_12px_30px_rgba(35,49,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#30471B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {finishing
              ? "Starting..."
              : "Start Speaking"}

            <ArrowRight size={19} />
          </button>
        </section>

        {error && (
          <p className="mt-3 text-center text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}