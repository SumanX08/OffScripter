
import { ArrowRight, Play } from "lucide-react";

import Button from "../ui/Button";
import HeroTopicReel from "./HeroTopicreel";
function AvatarStack() {
  const avatars = ["AS", "JM", "RK", "NP"];

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2" aria-hidden="true">
        {avatars.map((initials, index) => (
          <span
            key={initials}
            className={`grid size-9 place-items-center rounded-full border-2 border-cream text-[0.58rem] font-extrabold text-forest ${
              [
                "bg-amber",
                "bg-sage",
                "bg-tan",
                "bg-mist",
              ][index]
            }`}
          >
            {initials}
          </span>
        ))}
      </div>

      <p className="text-sm font-semibold text-forest/70">
        <strong className="text-forest">500+</strong>{" "}
        developers practicing
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <main id="top" className="overflow-hidden">
      <section
        className="mx-auto grid min-h-[calc(100vh-5rem)] w-[calc(100%-2.5rem)] max-w-7xl items-center gap-14 py-8 md:w-[calc(100%-4rem)] lg:grid-cols-[0.9fr_1.1fr]"
        aria-labelledby="hero-heading"
      >
        {/* Hero content */}
        <div className="relative z-10">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.19em] text-rust">
            Practice • Improve • Stand out
          </p>

          <h1
            id="hero-heading"
            className="mt-4 max-w-180 font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.89] tracking-[-0.045em]"
          >
            Stop reading.
            <span className="block italic text-rust">
              Start explaining.
            </span>
          </h1>

         

          <p className="mt-3 max-w-lg text-base leading-7 text-forest/65">
            OffScripter helps developers improve technical
            communication, explain complex concepts clearly, and
            build confidence for interviews and real-world
            conversations.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => {}} href="#challenge">
              Start a Challenge
              <ArrowRight size={17} />
            </Button>

            <Button
              onClick={() => {}}
              href="#product"
              variant="secondary"
            >
              <Play size={16} fill="currentColor" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-9 border-t border-forest/15 pt-6">
            <AvatarStack />
          </div>
        </div>

        {/* Topic spinner */}
        <div aria-label="Random technical topic generator">
          <HeroTopicReel/>
        </div>
      </section>
    </main>
  );
}
