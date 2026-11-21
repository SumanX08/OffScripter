import { motion } from "motion/react";
import {
  Check,
  Circle,
  Loader2,
  Lightbulb,
} from "lucide-react";

export type EvaluationStage =
  | "finalizing"
  | "uploading"
  | "analyzing"
  | "loading-results";

const stages = {
  finalizing: {
    title: "Finalizing your recording",
    description: "We're preparing your spoken response.",
    step: 0,
  },
  uploading: {
    title: "Processing your recording",
    description:
      "We're sending your recording for transcription and evaluation.",
    step: 1,
  },
  analyzing: {
    title: "Analyzing your explanation",
    description:
      "We're reviewing your technical knowledge and communication skills.",
    step: 1,
  },
  "loading-results": {
    title: "Your feedback is ready",
    description: "Preparing your personalized results.",
    step: 2,
  },
};

const steps = [
  "Finalize your recording",
  "Evaluate your explanation",
  "Prepare your results",
];

export default function EvaluationLoader({
  stage,
}: {
  stage: EvaluationStage;
}) {
  const current = stages[stage];

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cream px-6 py-12 text-forest"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Label */}
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">
          Challenge submitted
        </p>

        {/* Animated visual */}
        <div className="relative mx-auto mb-10 mt-10 flex size-24 items-center justify-center rounded-full bg-[#E9EDC9]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -inset-2 rounded-full border-2 border-forest/10 border-t-rust motion-reduce:hidden"
          />

          <div className="flex h-12 items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.span
                key={index}
                animate={{
                  scaleY: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.12,
                }}
                className="h-10 w-1.5 rounded-full bg-rust"
              />
            ))}
          </div>
        </div>

        {/* Stage message */}
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            {current.title}
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-forest/60">
            {current.description}
          </p>
        </motion.div>

        {/* Progress steps */}
        <div className="mx-auto mt-10 max-w-xs space-y-5 text-left">
          {steps.map((label, index) => {
            const completed = index < current.step;
            const active = index === current.step;

            return (
              <div
                key={label}
                className="flex items-center gap-3"
              >
                {completed ? (
                  <span className="grid size-6 place-items-center rounded-full bg-[#E9EDC9]">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                ) : active ? (
                  <Loader2
                    size={24}
                    className="animate-spin text-rust motion-reduce:animate-none"
                  />
                ) : (
                  <Circle
                    size={24}
                    className="text-forest/20"
                  />
                )}

                <span
                  className={`text-sm ${
                    completed || active
                      ? "text-forest"
                      : "text-forest/35"
                  } ${active ? "font-semibold" : ""}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Speaking tip */}
        <div className="mt-10 rounded-xl border border-forest/10 bg-[#F5EFD9] p-5 text-left">
          <div className="flex items-center gap-2">
            <Lightbulb
              size={16}
              className="text-rust"
            />

            <span className="text-xs font-bold uppercase tracking-wider">
              Speaking tip
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-forest/65">
            Start with the core concept, explain how it
            works, and finish with a practical example.
          </p>
        </div>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest/35">
          Keep speaking. Keep improving.
        </p>
      </motion.div>
    </main>
  );
}