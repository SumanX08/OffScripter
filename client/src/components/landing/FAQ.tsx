
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does OffScripter work?",
    answer:
      "OffScripter helps you improve technical communication through four simple steps. Spin a random technical topic, spend a few minutes researching it, explain it out loud for two minutes, and receive feedback on your performance.",
  },
  {
    question: "What kind of topics can I practice?",
    answer:
      "You can practice topics from frontend, backend, JavaScript, databases, system design, DevOps, AI, and other areas of software engineering. Topics are randomly generated to help you become comfortable explaining different technical concepts.",
  },
  {
    question: "How is the AI feedback generated?",
    answer:
      "After completing a speaking challenge, AI analyzes your explanation and evaluates aspects such as technical depth, fluency, clarity, structure, and filler words. You also receive actionable suggestions to improve your next attempt.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your Pro subscription at any time. Your Pro benefits will remain available until the end of your current billing period.",
  },
  {
    question: "Do I need to prepare before starting?",
    answer:
      "Not at all. That's the idea behind OffScripter! You get a random topic, some preparation time, and then explain what you understand. The goal is to practice thinking and communicating without relying on scripts.",
  },
  {
    question: "Is OffScripter suitable for beginners?",
    answer:
      "Absolutely. Whether you're a student, fresher, or experienced developer, OffScripter helps you become better at explaining technical concepts and communicating your knowledge confidently.",
  },
];

const reveal = {
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

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="bg-cream px-6 py-20 md:px-12 lg:px-16"
    >
      <motion.div
        className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.5fr] lg:gap-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        transition={{ staggerChildren: 0.12 }}
      >
        {/* Section heading */}
        <motion.div variants={reveal}>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rust" />

            <span className="font-sans text-[10px] font-extrabold uppercase tracking-[0.2em] text-forest">
              FAQ
            </span>
          </div>

          <h2 className="font-serif text-4xl leading-[1.05] text-forest md:text-5xl">
            Frequently asked{" "}
            <span className="text-rust">questions.</span>
          </h2>

          <p className="mt-5 max-w-sm font-sans text-sm leading-7 text-olive">
            Everything you need to know about practicing, improving,
            and becoming a more confident communicator with OffScripter.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={reveal}
          className="divide-y divide-forest/15 border-y border-forest/15"
        >
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full items-center justify-between gap-6 py-3 text-left transition-colors hover:text-rust"
                >
                  <span className="font-sans text-sm font-bold text-forest md:text-base">
                    {faq.question}
                  </span>

                  <motion.span
                    animate={{
                      rotate: isOpen ? 180 : 0,
                      borderColor: isOpen ? "rgba(38,57,17,0.35)" : "rgba(38,57,17,0.15)",
                    }}
                    transition={{ duration: 0.25 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center border text-forest"
                  >
                    {isOpen ? (
                      <Minus size={15} className="text-rust" />
                    ) : (
                      <Plus size={15} />
                    )}
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.3, ease: "easeInOut" },
                        opacity: { duration: 0.2 },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-5 pr-10 font-sans text-sm leading-7 text-olive">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
