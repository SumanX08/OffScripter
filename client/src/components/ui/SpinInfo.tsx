
import { ArrowRight } from "lucide-react";
import Button from "./Button";

type SpinInfoProps = {
  spinning: boolean;
  selectedTopic?: string;
  attemptId?: string;
  handleStartChallenge: () => void;
};

export default function SpinInfo({
  spinning,
  selectedTopic,
  attemptId,
  handleStartChallenge,
}: SpinInfoProps) {
  // After topic generation, show the topic card and Start Challenge button.
  if (selectedTopic) {
    return (
      <div className="w-full rounded-2xl border border-forest/10 bg-soft p-8 text-center md:p-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-rust">
          Your topic
        </p>

        <h2 className="font-serif text-3xl font-bold text-forest">
          {selectedTopic}
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-forest/55">
          You've got your topic. Research it, organize your thoughts,
          then explain it without a script.
        </p>

        {/* Start Challenge button */}
        {attemptId && !spinning && (
          <div className="mt-6 flex justify-center">
            <Button onClick={handleStartChallenge}>
              Start Challenge
              <ArrowRight size={17} />
            </Button>
          </div>
        )}

        {/* Topic categories */}
        
      </div>
    );
  }

  // Before topic generation, show the three steps.
  const steps = [
    {
      number: "01",
      title: "Generate a topic",
      description: "Let chance choose your technical topic.",
    },
    {
      number: "02",
      title: "Research about the topic",
      description: "Outline the ideas you want to communicate.",
    },
    {
      number: "03",
      title: "Explain it aloud",
      description: "Get focused feedback on your delivery.",
    },
  ];

  return (
    <div className="w-full ">
      <div className="relative space-y-8 sm:space-y-10">
        {/* Vertical timeline */}
        <div className="absolute bottom-7 left-[23px] top-7 w-px bg-[#E9DCC3]" />

        {steps.map((step) => (
          <div
            key={step.number}
            className="relative flex items-start gap-5"
          >
            {/* Step number */}
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E8B77D]/60 bg-[#FFFDF4] font-serif text-xl font-bold text-[#C66A24]">
              {step.number}
            </div>

            {/* Step content */}
            <div className="min-w-0 pt-0.5">
              <h2 className="font-serif text-lg font-bold text-forest sm:text-xl">
                {spinning && step.number === "01"
                  ? "Choosing your topic..."
                  : step.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-forest/60 sm:text-base">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
