
import { motion } from "motion/react";
import {
  RefreshCw,
  Timer,
  Activity,
  GitBranch,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "A fresh technical topic, every time",
    description:
      "Practice explaining random topics across frontend, backend, databases, AI, and the wider tech stack.",
  },
  {
    icon: Timer,
    title: "Focused preparation time",
    description:
      "Set aside a few focused minutes to research the topic and organize your thoughts before speaking.",
  },
  {
    icon: Activity,
    title: "Feedback with substance",
    description:
      "Get insights into technical depth, fluency, structure, clarity, and other speaking skills.",
  },
  {
    icon: GitBranch,
    title: "Progress you can feel",
    description:
      "Build a consistent technical speaking habit with streaks, milestones, and meaningful progress.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-cream px-6 py-24 md:px-10 lg:px-16"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
        {/* Left Content */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: -25 },
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1] as const,
                staggerChildren: 0.12,
              },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            variants={reveal}
            className="mb-7 flex items-center gap-3"
          >
            <span
              className="h-2 w-2 rounded-full bg-rust"
              aria-hidden="true"
            />

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-forest">
              A different kind of practice
            </span>
          </motion.div>

          <motion.h2
            id="features-heading"
            variants={reveal}
            className="max-w-xl font-serif text-4xl leading-[0.95] text-forest md:text-5xl"
          >
            Knowing something
            <br />
            isn't the same as
            <br />
            <span className="text-rust">explaining it.</span>
          </motion.h2>

          <motion.p
            variants={reveal}
            className="mt-8 max-w-lg text-base leading-7 text-olive md:text-md"
          >
            OffScripter turns passive technical knowledge into active
            communication practice. Practice explaining technical concepts
            clearly, build confidence, and become a better technical
            communicator.
          </motion.p>

          <motion.a
            variants={reveal}
            href="#how-it-works"
            whileHover={{ x: 5 }}
            className="group mt-8 inline-flex items-center gap-3 text-sm font-bold text-forest transition-colors hover:text-rust"
          >
            Meet your new practice ground

            <ArrowUpRight
              size={20}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
              aria-hidden="true"
            />
          </motion.a>
        </motion.div>

        {/* Right Features */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: 0.13 }}
        >
          <div className="border-t border-olive/25">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={reveal}
                  className="group flex items-center gap-5 border-b border-olive/25 py-3"
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-olive/25 bg-cream transition-colors duration-200 group-hover:bg-mist"
                    aria-hidden="true"
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.7}
                      className="text-olive"
                    />
                  </motion.div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-forest md:text-base">
                      {feature.title}
                    </h3>

                    <p className="text-xs leading-5 text-olive md:text-sm">
                      {feature.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    whileHover={{ x: 4, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-rust"
                  >
                    <ArrowUpRight
                      size={19}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
