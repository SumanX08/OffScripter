import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Lightbulb,
  RotateCcw,
  X,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuthenticatedApi } from "../hooks/useAuthApi";

type Evaluation = {
  overallScore: number;
  technicalAccuracy: number;
  clarity: number;
  structure: number;
  depth: number;
  examples: number;
  conciseness: number;
  fillerWordsCount: number;
  missingConcepts: string[];
  incorrectClaims: string[];
  feedback: string;
};

type Attempt = {
  id: string;
  transcript: string | null;
  evaluation: Evaluation | null;
  topic: {
    title: string;
    category: string;
    difficulty: string;
  };
};

type AnalysisTab = "well" | "improve" | "next";

const scoreItems = [
  {
    key: "technicalAccuracy",
    label: "Technical Accuracy",
  },
  {
    key: "clarity",
    label: "Clarity",
  },
  {
    key: "structure",
    label: "Structure",
  },
  {
    key: "depth",
    label: "Technical Depth",
  },
  {
    key: "examples",
    label: "Examples",
  },
  {
    key: "conciseness",
    label: "Conciseness",
  },
] as const;

function getScoreMessage(score: number) {
  if (score >= 90) {
    return {
      title: "Excellent work!",
      subtitle: "Your explanation was strong across the board.",
    };
  }

  if (score >= 80) {
    return {
      title: "Great job!",
      subtitle: "You gave a solid technical explanation.",
    };
  }

  if (score >= 70) {
    return {
      title: "Good attempt!",
      subtitle:
        "You have a strong foundation. A few improvements can make your explanation sharper.",
    };
  }

  if (score >= 60) {
    return {
      title: "Nice start!",
      subtitle: "Keep practicing and focus on the areas below.",
    };
  }

  return {
    title: "Keep practicing!",
    subtitle:
      "Every attempt helps you become a better technical speaker.",
  };
}

function getSuggestions(evaluation: Evaluation) {
  const suggestions: string[] = [];

  if (evaluation.depth < 80) {
    suggestions.push("Go deeper into implementation details");
  }

  if (evaluation.examples < 80) {
    suggestions.push("Add real-world examples");
  }

  if (evaluation.conciseness < 80) {
    suggestions.push("Be more concise");
  }

  if (evaluation.fillerWordsCount > 5) {
    suggestions.push("Reduce filler words");
  }

  if (evaluation.clarity < 80) {
    suggestions.push("Make your explanation easier to follow");
  }

  if (evaluation.structure < 80) {
    suggestions.push("Use a clearer beginning, middle, and end");
  }

  if (suggestions.length === 0) {
    suggestions.push("Try a harder technical topic");
    suggestions.push("Explain the concept using a real-world example");
    suggestions.push("Challenge yourself to be even more concise");
    suggestions.push("Practice explaining without preparation");
  }

  return suggestions.slice(0, 4);
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-cream";
  if (score >= 60) return "text-amber";
  return "text-rust";
}

export default function Results() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const api = useAuthenticatedApi();
  const { user } = useUser();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] =
    useState<AnalysisTab>("well");

  useEffect(() => {
    if (!attemptId) return;

    const loadAttempt = async () => {
      try {
        const response = await api.get(`/attempts/${attemptId}`);

        setAttempt(response.data.data);
      } catch (error) {
        console.error("Failed to load results:", error);
        setError("Unable to load your results.");
      } finally {
        setLoading(false);
      }
    };

    void loadAttempt();
  }, [attemptId, api]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream px-5 py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
          <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-mist border-t-olive" />

          <h2 className="font-serif text-3xl text-forest">
            Loading your results...
          </h2>

          <p className="mt-2 text-sm text-forest/60">
            Getting your feedback ready.
          </p>
        </div>
      </main>
    );
  }

  if (error || !attempt) {
    return (
      <main className="min-h-screen bg-cream px-5 py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
          <h2 className="font-serif text-3xl text-forest">
            Something went wrong
          </h2>

          <p className="mt-3 text-sm text-forest/60">
            {error || "Results not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-7 rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-cream transition hover:bg-olive"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!attempt.evaluation) {
    return (
      <main className="min-h-screen bg-cream px-5 py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
          <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-mist">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-sage border-t-olive" />
          </div>

          <h2 className="font-serif text-3xl text-forest">
            Analyzing your explanation...
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-forest/60">
            We're reviewing your technical accuracy, clarity,
            structure, depth, and examples.
          </p>
        </div>
      </main>
    );
  }

  const { evaluation } = attempt;

  const score = Math.round(evaluation.overallScore);
  const scoreMessage = getScoreMessage(score);

  const displayName =
    user?.firstName ||
    user?.username ||
    "there";

  const suggestions = getSuggestions(evaluation);

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1180px]">

        {/* Header */}
        <header className="mb-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-rust">
            Challenge complete
          </p>

          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-forest sm:text-6xl lg:text-[4.2rem]">
            {scoreMessage.title.replace("!", "")},{" "}
            {displayName}.
          </h1>

          <p className="mt-4 text-base text-forest/60 sm:text-lg">
            You explained{" "}
            <span className="font-semibold text-forest">
              {attempt.topic.title}
            </span>
            .
          </p>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-forest/45">
            {scoreMessage.subtitle}
          </p>
        </header>

        {/* Score + Breakdown */}
        <section className="mb-7 grid overflow-hidden border border-forest/15 bg-[#FFFDF4] lg:grid-cols-[340px_1fr]">

          {/* Overall score */}
          <div className="flex flex-col items-center justify-center bg-forest px-8 py-12 text-center">
            <p className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-amber">
              Overall score
            </p>

            <div
              className="relative flex h-56 w-56 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  var(--color-amber) ${score}%,
                  rgba(255,255,255,0.12) 0
                )`,
              }}
            >
              <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-forest">
                <div className="flex items-baseline">
                  <span
                    className={`font-serif text-6xl leading-none ${getScoreColor(
                      score
                    )}`}
                  >
                    {score}
                  </span>

                  <span className="ml-1 text-sm text-cream/40">
                    /100
                  </span>
                </div>
              </div>
            </div>

            <h2 className="mt-8 font-serif text-2xl font-bold text-cream">
              {score >= 80
                ? "Strong explanation"
                : score >= 60
                  ? "Solid foundation"
                  : "Keep practicing"}
            </h2>

            <p className="mt-2 text-xs text-cream/45">
              Keep building your technical voice.
            </p>
          </div>

          {/* Breakdown */}
          <div className="px-7 py-10 sm:px-10 lg:px-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-rust">
              Score breakdown
            </p>

            <h2 className="max-w-xl font-serif text-3xl leading-tight text-forest sm:text-4xl">
              {scoreMessage.title.replace("!", "")},{" "}
              room to refine.
            </h2>

            <div className="mt-10 space-y-6">
              {scoreItems.map((item) => {
                const value = Math.round(evaluation[item.key]);

                return (
                  <div key={item.key}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-forest">
                        {item.label}
                      </span>

                      <span className="font-serif text-xl text-forest">
                        {value}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden bg-[#E3E7CF]">
                      <div
                        className="h-full bg-rust transition-all duration-1000"
                        style={{
                          width: `${value}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filler words */}
            <div className="mt-8 border-t border-forest/10 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-forest">
                  Filler words
                </span>

                <span className="font-serif text-xl text-forest">
                  {evaluation.fillerWordsCount}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis */}
        <section className="mb-7 grid overflow-hidden border border-forest/15 bg-[#FFFDF4] md:grid-cols-[325px_1fr]">

          {/* Tabs */}
          <div className="border-b border-forest/10 md:border-b-0 md:border-r">
            <AnalysisTabButton
              active={activeTab === "well"}
              onClick={() => setActiveTab("well")}
            >
              What you did well
            </AnalysisTabButton>

            <AnalysisTabButton
              active={activeTab === "improve"}
              onClick={() => setActiveTab("improve")}
            >
              What to improve
            </AnalysisTabButton>

            <AnalysisTabButton
              active={activeTab === "next"}
              onClick={() => setActiveTab("next")}
            >
              Suggested next attempt
            </AnalysisTabButton>
          </div>

          {/* Content */}
          <div className="px-7 py-10 sm:px-10 lg:px-14">

            {activeTab === "well" && (
              <AnalysisContent
                label="Analysis"
                title="You built the explanation from fundamentals."
              >
                <p className="text-sm leading-7 text-forest/60 sm:text-base">
                  {evaluation.feedback}
                </p>

                <div className="mt-7 space-y-4">
                  {evaluation.missingConcepts.length === 0 && (
                    <>
                      <FeedbackPoint>
                        Strong technical foundation
                      </FeedbackPoint>

                      <FeedbackPoint>
                        Clear explanation of the core concept
                      </FeedbackPoint>

                      <FeedbackPoint>
                        Good progression through the topic
                      </FeedbackPoint>
                    </>
                  )}

                  {evaluation.missingConcepts.length > 0 && (
                    <FeedbackPoint>
                      You covered the core idea and communicated
                      the main concept clearly.
                    </FeedbackPoint>
                  )}
                </div>
              </AnalysisContent>
            )}

            {activeTab === "improve" && (
              <AnalysisContent
                label="Areas to improve"
                title="A few refinements can make your explanation sharper."
              >
                {evaluation.missingConcepts.length > 0 ? (
                  <div className="space-y-4">
                    {evaluation.missingConcepts
                      .slice(0, 5)
                      .map((concept) => (
                        <div
                          key={concept}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-amber/20 text-rust">
                            <Lightbulb size={15} />
                          </span>

                          <p className="text-sm leading-7 text-forest/70 sm:text-base">
                            Go deeper on{" "}
                            <span className="font-semibold text-forest">
                              {concept}
                            </span>
                            .
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-forest/60 sm:text-base">
                    You covered the important concepts well.
                    Keep practicing to make your explanations
                    even sharper.
                  </p>
                )}

                {evaluation.incorrectClaims.length > 0 && (
                  <div className="mt-8 border-t border-forest/10 pt-7">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-rust">
                      Claims to revisit
                    </p>

                    <div className="space-y-3">
                      {evaluation.incorrectClaims
                        .slice(0, 4)
                        .map((claim) => (
                          <div
                            key={claim}
                            className="flex items-start gap-3"
                          >
                            <X
                              size={17}
                              className="mt-1 shrink-0 text-rust"
                            />

                            <p className="text-sm leading-6 text-forest/70">
                              {claim}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </AnalysisContent>
            )}

            {activeTab === "next" && (
              <AnalysisContent
                label="Next challenge"
                title="Here's what to focus on in your next attempt."
              >
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <FeedbackPoint key={suggestion}>
                      {suggestion}
                    </FeedbackPoint>
                  ))}
                </div>
              </AnalysisContent>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="mb-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group flex min-h-14 items-center justify-center gap-3 border border-forest/15 bg-[#FFFDF4] px-7 text-sm font-bold text-forest transition hover:-translate-y-0.5 hover:border-forest/30"
          >
            <RotateCcw size={18} />

            Dashboard

            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* Transcript */}
        <section
          id="transcript"
          className="mb-8 overflow-hidden border border-forest/10 bg-[#FFFDF4]"
        >
          <details>
            <summary className="cursor-pointer px-6 py-5 text-sm font-bold text-forest sm:px-7">
              View Full Transcript
            </summary>

            <div className="border-t border-forest/10 px-6 py-6 sm:px-7">
              <p className="text-sm leading-7 text-forest/65 sm:text-base">
                {attempt.transcript || "No transcript available."}
              </p>
            </div>
          </details>
        </section>

        <p className="pb-8 text-center text-xs tracking-[0.12em] text-forest/30">
          KEEP SPEAKING. KEEP IMPROVING.
        </p>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function AnalysisTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[100px] w-full items-center px-7 text-left text-sm font-semibold transition sm:px-8 ${
        active
          ? "border-l-4 border-rust bg-[#FAEDCF] text-forest"
          : "border-l-4 border-transparent text-forest/55 hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}

function AnalysisContent({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-rust">
        {label}
      </p>

      <h2 className="max-w-2xl font-serif text-3xl leading-[1.1] text-forest sm:text-4xl">
        {title}
      </h2>

      <div className="mt-5">{children}</div>
    </div>
  );
}

function FeedbackPoint({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sage/50 text-forest">
        <Check size={15} strokeWidth={2.5} />
      </span>

      <p className="text-sm font-semibold leading-6 text-forest/75 sm:text-base">
        {children}
      </p>
    </div>
  );
}