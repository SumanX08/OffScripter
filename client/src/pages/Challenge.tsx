
import { useState } from "react";
import { Menu, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TopicWheel from "../components/ui/TopicWheel";
import SpinInfo from "../components/ui/SpinInfo";
import { useAuthenticatedApi } from "../hooks/useAuthApi";

type SpinResponse = {
  attemptId: string;
  topic: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    researchTime: number;
    speakingTime: number;
  };
};

type ApiErrorResponse = {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
};

export default function Challenge() {
  const api = useAuthenticatedApi();
  const navigate = useNavigate();

  const [, setSidebarOpen] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const handleSpin = async () => {
    if (spinning) return;

    try {
      setSpinning(true);
      setError("");
      setLimitExceeded(false);
      setUpgradeRequired(false);

      setSelectedTopic(null);
      setAttemptId(null);

      const response = await api.post("/topic/spin", {});

      const data: SpinResponse = response.data.data;

      if (!data?.attemptId) {
        throw new Error("No attempt ID returned from server.");
      }

      if (!data.topic?.title) {
        throw new Error("No challenge question returned from server.");
      }

      setAttemptId(data.attemptId);
      setSelectedTopic(data.topic.title);
    } catch (error: unknown) {
      console.error("Failed to generate challenge:", error);

      const apiError = (
        error as {
          response?: {
            data?: ApiErrorResponse;
          };
        }
      ).response?.data?.error;

      if (apiError?.code === "FREE_DAILY_LIMIT_REACHED") {
        setLimitExceeded(true);
        setUpgradeRequired(true);
        setError(
          "You've exhausted your free daily topics. Upgrade to Pro for more topics."
        );
      } else if (apiError?.code === "PRO_DAILY_LIMIT_REACHED") {
        setLimitExceeded(true);
        setUpgradeRequired(false);
        setError(
          "You've used all your daily topics. Your limit resets tomorrow. Come back tomorrow!"
        );
      } else {
        setLimitExceeded(false);
        setUpgradeRequired(false);
        setError(
          apiError?.message ||
            "Couldn't create your challenge. Please try again."
        );
      }

      setSpinning(false);
    }
  };

  const handleAnimationComplete = () => {
    setSpinning(false);
  };

  const handleStartChallenge = () => {
    if (!attemptId) {
      setError("Your challenge could not be started. Please spin again.");
      return;
    }

    navigate(`/challenge/${attemptId}/research`);
  };

  return (
    <div className="flex min-h-screen bg-[#FCF9EC] text-[#263911]">
      <main className="min-w-0 flex-1">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-[#263911]/10 px-5 py-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#263911] transition hover:bg-[#263911]/5"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <span className="font-serif text-lg font-bold">
            OffScripter
          </span>

          <div className="w-9" />
        </div>

        {/* Main Content */}
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          {/* Heading */}
          <div className="mb-20 text-center">
            <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em] text-[#263911] sm:text-5xl">
              Pick your topic
            </h1>
          </div>

          {/* Challenge Area */}
          <div className="grid flex-1 grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
            {/* Topic Wheel */}
            <div className="flex w-full items-center justify-center">
              <TopicWheel
                spinning={spinning}
                selectedTopic={selectedTopic}
                onSpin={handleSpin}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>

            {/* Spin Info */}
            <div className="flex w-full min-w-0 items-center justify-center lg:justify-self-center">
              <SpinInfo
                spinning={spinning}
                selectedTopic={selectedTopic ?? undefined}
                attemptId={attemptId ?? undefined}
                handleStartChallenge={handleStartChallenge}
              />
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div
              role="alert"
              className={`mx-auto mt-8 flex w-full max-w-xl items-start gap-3 rounded-xl border px-5 py-4 ${
                limitExceeded
                  ? "border-rust/30 bg-amber/10"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <AlertCircle
                size={20}
                className={`mt-0.5 shrink-0 ${
                  limitExceeded ? "text-rust" : "text-red-600"
                }`}
              />

              <div className="flex-1">
                <p className="font-semibold text-forest">
                  {limitExceeded
                    ? "Daily limit reached"
                    : "Unable to create challenge"}
                </p>

                <p className="mt-1 text-sm leading-6 text-forest/75">
                  {error}
                </p>

                {upgradeRequired && (
                  <button
                    type="button"
                    onClick={() => navigate("/pricing")}
                    className="mt-3 text-sm font-bold text-rust underline underline-offset-4 transition hover:text-forest"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
