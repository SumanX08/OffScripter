
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import Button from "../ui/Button";
import HeroTopicReel from "./HeroTopicReel";
import { SignInButton } from "@clerk/clerk-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.16, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  return (
    <main id="top" className="overflow-hidden">
      <section
        className="mx-auto grid min-h-[calc(100vh-5rem)] w-[calc(100%-2.5rem)] max-w-7xl items-center gap-14 py-4 md:w-[calc(100%-4rem)] lg:grid-cols-[0.9fr_1.1fr]"
        aria-labelledby="hero-heading"
      >
        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={itemVariants}
            className="text-[0.7rem] font-extrabold uppercase tracking-[0.19em] text-rust"
          >
            Practice • Improve • Stand out
          </motion.p>

          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="mt-4 max-w-180 font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.89] tracking-[-0.045em]"
          >
            Stop reading.
            <span className="mt-6 block italic text-rust">
              Start explaining.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-lg text-base leading-7 text-forest/65"
          >
            OffScripter helps developers improve technical
            communication, explain complex concepts clearly, and
            build confidence for interviews and real-world
            conversations.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <SignInButton>
              <Button onClick={() => {}} href="#challenge">
                Start a Challenge
                <ArrowRight size={17} />
              </Button>
            </SignInButton>

            <Button
              onClick={() => {}}
              href="#product"
              variant="secondary"
            >
              <Play size={16} fill="currentColor" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          aria-label="Random technical topic generator"
          initial={{ opacity: 0, scale: 0.94, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <HeroTopicReel />
        </motion.div>
      </section>
    </main>
  );
}
