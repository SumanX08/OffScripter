import { useState } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/ui/Sidebar";
import TopicWheel from "../components/ui/TopicWheel";
import SpinInfo from "../components/ui/SpinInfo";
import Button from "../components/ui/Button";
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

export default function Challenge() {
  const api = useAuthenticatedApi();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [spinning, setSpinning] =
    useState(false);

  const [selectedTopic, setSelectedTopic] =
    useState<string | null>(null);

  const [attemptId, setAttemptId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const handleSpin = async () => {
    if (spinning) {
      return;
    }

    try {
      setSpinning(true);
      setError("");

      setSelectedTopic(null);
      setAttemptId(null);

      const response = await api.post(
        "/topic/spin",
        {},
      );

      const data: SpinResponse =
        response.data.data;

      if (!data?.attemptId) {
        throw new Error(
          "No attempt ID returned from server.",
        );
      }

      if (!data.topic?.title) {
        throw new Error(
          "No challenge question returned from server.",
        );
      }

      setAttemptId(data.attemptId);
      setSelectedTopic(data.topic.title);
    } catch (error) {
      console.error(
        "Failed to generate challenge:",
        error,
      );

      setError(
        "Couldn't create your challenge. Please try again.",
      );

      setSpinning(false);
    }
  };

  const handleAnimationComplete = () => {
    setSpinning(false);
  };

  const handleStartChallenge = () => {
    if (!attemptId) {
      setError(
        "Your challenge could not be started. Please spin again.",
      );
      return;
    }

    navigate(
      `/challenge/${attemptId}/research`,
    );
  };

  return (
    <div className="flex min-h-screen bg-[#FCF9EC] text-[#263911]">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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
          <div className="mb-10 text-center">

            <h1 className="font-serif text-4xl leading-tight tracking-[-0.03em] text-[#263911] sm:text-5xl">
              Pick your challenge.
            </h1>

           
          </div>

          {/* Challenge Area */}
          <div className="grid flex-1 items-start gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
            {/* Topic Wheel */}
            <div className="flex justify-center">
              <TopicWheel
                spinning={spinning}
                selectedTopic={selectedTopic}
                onSpin={handleSpin}
                onAnimationComplete={
                  handleAnimationComplete
                }
              />
            </div>

            {/* Spin Info */}
            <div className="w-full max-w-xl justify-self-center lg:max-w-md">
              <SpinInfo
                spinning={spinning}
                selectedTopic={
                  selectedTopic ?? undefined
                }
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-5 text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Start Challenge */}
          {selectedTopic &&
            !spinning &&
            attemptId && (
              <div className="mt-7 flex justify-center">
                <Button
                  onClick={
                    handleStartChallenge
                  }
                >
                  Start Challenge
                  <ArrowRight size={17} />
                </Button>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}