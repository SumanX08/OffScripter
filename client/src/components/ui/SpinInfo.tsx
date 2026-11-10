
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Button from "./Button";

type SpinInfoProps = {
  spinning: boolean;
  selectedTopic?: string;
  attemptId?: string;
  handleStartChallenge: () => void;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function SpinInfo({
  spinning,
  selectedTopic,
  attemptId,
  handleStartChallenge,
}: SpinInfoProps) {
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
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {selectedTopic ? (
          <motion.div
            key="topic-card"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full rounded-2xl border border-forest/10 bg-soft p-8 text-center md:p-10"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-rust"
            >
              Your topic
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-serif text-3xl font-bold text-forest"
            >
              {selectedTopic}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              className="mx-auto mt-4 max-w-sm text-sm leading-6 text-forest/55"
            >
              You've got your topic. Research it, organize your thoughts,
              then explain it without a script.
            </motion.p>

            {attemptId && !spinning && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.4 }}
                className="mt-6 flex justify-center"
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button onClick={handleStartChallenge}>
                    Start Challenge
                    <ArrowRight size={17} />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="steps"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -12 }}
            className="relative space-y-8 sm:space-y-10"
          >
            {/* Vertical timeline */}
            <div className="absolute bottom-7 left-[23px] top-7 w-px bg-[#E9DCC3]" />

            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
