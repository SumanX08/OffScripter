import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
 
  Lightbulb,
  RotateCcw,
  X,
} from "lucide-react";

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
      subtitle:
        "Your explanation was strong across the board.",
    };
  }

  if (score >= 80) {
    return {
      title: "Great job!",
      subtitle:
        "You gave a solid technical explanation.",
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
      subtitle:
        "Keep practicing and focus on the areas below.",
    };
  }

  return {
    title: "Keep practicing!",
    subtitle:
      "Every attempt helps you become a better technical speaker.",
  };
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-forest";
  if (score >= 60) return "text-amber";
  return "text-rust";
}

export default function Results() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const api = useAuthenticatedApi();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

          <p className="mt-2 font-sans text-sm text-forest/60">
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

          <p className="mt-3 font-sans text-sm text-forest/60">
            {error || "Results not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-7 rounded-xl bg-forest px-6 py-3 font-sans text-sm font-semibold text-cream transition hover:bg-olive"
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

          <p className="mt-3 max-w-md font-sans text-sm leading-6 text-forest/60">
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

  return (
    <main className="min-h-screen bg-cream px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <header className="mb-10 text-center sm:mb-12">
          <p className="mb-2 font-sans text-xs font-bold uppercase tracking-[0.18em] text-olive">
            Challenge complete
          </p>

          <h1 className="font-serif text-4xl leading-tight text-forest sm:text-5xl">
            {scoreMessage.title}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl font-sans text-base text-forest/60 sm:text-lg">
            You explained{" "}
            <span className="font-semibold text-forest">
              {attempt.topic.title}
            </span>
          </p>

          <p className="mx-auto mt-2 max-w-xl font-sans text-sm leading-6 text-forest/50">
            {scoreMessage.subtitle}
          </p>
        </header>

        {/* Score */}
        <section className="mb-8 flex flex-col items-center">
          <div
            className="relative flex h-52 w-52 items-center justify-center rounded-full sm:h-56 sm:w-56"
            style={{
              background: `conic-gradient(#606c38 ${score}%, #e9edc9 0)`,
            }}
          >
            <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-cream">
              <span
                className={`font-serif text-6xl leading-none ${getScoreColor(score)}`}
              >
                {score}
              </span>

              <span className="mt-2 font-sans text-sm text-forest/45">
                /100
              </span>
            </div>
          </div>

          <p className="mt-5 font-sans text-sm text-forest/55">
            Overall Score
          </p>
        </section>

        {/* Breakdown */}
        <section className="mb-5 rounded-[24px] border border-[#e8d9b7] bg-soft p-6 shadow-sm sm:p-9">
          <div className="mb-7">
            <h2 className="font-serif text-2xl text-forest sm:text-3xl">
              Breakdown
            </h2>

            <p className="mt-1 font-sans text-sm text-forest/55">
              Here's how your explanation performed.
            </p>
          </div>

          <div className="space-y-6">
            {scoreItems.map((item) => {
              const value = Math.round(evaluation[item.key]);

              return (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="font-sans text-sm text-forest sm:text-base">
                      {item.label}
                    </span>

                    <span className="font-sans text-sm font-semibold text-forest">
                      {value}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full rounded-full bg-olive transition-all duration-700"
                      style={{
                        width: `${value}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Filler words */}
        <section className="mb-5 rounded-[24px] border border-[#e8d9b7] bg-soft p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/20 text-rust">
              <MessageIcon />
            </div>

            <div>
              <p className="font-sans text-sm text-forest/55">
                Speaking signal
              </p>

              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-serif text-3xl text-forest">
                  {evaluation.fillerWordsCount}
                </span>

                <span className="font-sans text-sm text-forest/60">
                  filler words detected
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* What went well / improve */}
        <div className="mb-5 grid gap-5 md:grid-cols-2">

          {/* What went well */}
          <section className="rounded-[24px] border border-[#e8d9b7] bg-soft p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/70 text-forest">
                <Check size={20} strokeWidth={2.5} />
              </div>

              <h2 className="font-serif text-2xl text-forest">
                What you did well
              </h2>
            </div>

            <p className="font-sans text-sm leading-7 text-forest/70 sm:text-base">
              {evaluation.feedback}
            </p>
          </section>

          {/* What to improve */}
          <section className="rounded-[24px] border border-[#e8d9b7] bg-soft p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/20 text-rust">
                <Lightbulb size={20} />
              </div>

              <h2 className="font-serif text-2xl text-forest">
                What to improve
              </h2>
            </div>

            {evaluation.missingConcepts.length > 0 ? (
              <ul className="space-y-3">
                {evaluation.missingConcepts.slice(0, 4).map((concept) => (
                  <li
                    key={concept}
                    className="flex items-start gap-3 font-sans text-sm leading-6 text-forest/70 sm:text-base"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sans text-sm leading-7 text-forest/70">
                You covered the important concepts well. Keep
                practicing to make your explanations even sharper.
              </p>
            )}
          </section>
        </div>

        {/* Suggested next attempt */}
        <section className="mb-8 rounded-[24px] border border-[#d6dfb3] bg-mist p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/30 text-rust">
              <Lightbulb size={20} />
            </div>

            <h2 className="font-serif text-2xl text-forest sm:text-3xl">
              Suggested next attempt
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {getSuggestions(evaluation).map((suggestion) => (
              <div
                key={suggestion}
                className="flex items-start gap-3 font-sans text-sm text-forest/75 sm:text-base"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Incorrect claims */}
        {evaluation.incorrectClaims.length > 0 && (
          <section className="mb-8 rounded-[24px] border border-[#e8d9b7] bg-soft p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rust/10 text-rust">
                <X size={20} />
              </div>

              <h2 className="font-serif text-2xl text-forest">
                Claims to revisit
              </h2>
            </div>

            <ul className="space-y-3">
              {evaluation.incorrectClaims.map((claim) => (
                <li
                  key={claim}
                  className="flex items-start gap-3 font-sans text-sm leading-6 text-forest/70"
                >
                  <X
                    size={16}
                    className="mt-1 shrink-0 text-rust"
                  />
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-forest px-6 font-sans text-base font-semibold text-cream shadow-sm transition hover:-translate-y-0.5 hover:bg-olive"
          >
            <RotateCcw size={19} />

            Dashboard       

            <ArrowRight
              size={19}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

         
        </div>

        {/* Transcript */}
        <section
          id="transcript"
          className="mt-5 overflow-hidden rounded-[24px] border border-[#e8d9b7] bg-soft"
        >
          <details>
            <summary className="cursor-pointer px-6 py-5 font-sans text-sm font-semibold text-forest sm:px-7">
              View Full Transcript
            </summary>

            <div className="border-t border-[#e8d9b7] px-6 py-6 sm:px-7">
              <p className="font-sans text-sm leading-7 text-forest/70">
                {attempt.transcript || "No transcript available."}
              </p>
            </div>
          </details>
        </section>

        <p className="mt-8 text-center font-sans text-xs text-forest/35">
          Keep speaking. Keep improving.
        </p>
      </div>
    </main>
  );
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

function MessageIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}