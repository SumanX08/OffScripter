import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const questions = [
  "Explain how Redis Pub/Sub works and when you would use it.",
  "What happens inside the Node.js event loop?",
  "How does JWT authentication work and what are its security concerns?",
  "How would you design an API that handles 10,000 requests per second?",
  "Explain database indexing and how it improves query performance.",
  "What is the difference between SQL and NoSQL databases?",
  "Explain how WebSockets work and when you would choose them over HTTP.",
  "What happens when you enter a URL into your browser?",
  "Explain React's reconciliation process and why it matters.",
  "How does caching improve the performance of a web application?",
  "What is the difference between authentication and authorization?",
  "Explain how Docker containers work and why developers use them.",
];

export default function HeroTopicReel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) =>
        window.clearTimeout(timeout)
      );
    };
  }, []);

  const getQuestion = (index: number) => {
    return questions[
      (index + questions.length) % questions.length
    ];
  };

  const spin = () => {
    if (spinning) return;

    setSpinning(true);

    let step = 0;

    const run = () => {
      step++;

      setActiveIndex((current) => {
        return (current + 1) % questions.length;
      });

      setAnimationKey((key) => key + 1);

      if (step >= 12) {
        setSpinning(false);
        return;
      }

      const delay =
        step <= 5
          ? 70
          : step <= 8
            ? 110
            : step <= 10
              ? 160
              : 230;

      const timeout = window.setTimeout(run, delay);

      timeoutRefs.current.push(timeout);
    };

    run();
  };

  const previousQuestion = getQuestion(activeIndex - 1);
  const currentQuestion = getQuestion(activeIndex);
  const nextQuestion = getQuestion(activeIndex + 1);

  return (
    <div className="mx-auto flex items-center w-full max-w-[620px]">

      {/* Reel */}
      <div
        className={`
          relative w-full overflow-hidden
          rounded-[4px]
          border border-forest/30
          bg-soft
          shadow-[8px_10px_0_rgba(204,213,174,0.7),0_22px_45px_rgba(40,54,24,0.12)]
          transition-all duration-300
          ${
            spinning
              ? "shadow-[8px_10px_0_rgba(204,213,174,0.7),0_22px_45px_rgba(96,108,56,0.18)]"
              : ""
          }
        `}
      >

        {/* Inner paper border */}
        <div className="pointer-events-none absolute inset-2 z-20 border border-forest/15" />

        {/* Top binding */}
        <div className="absolute left-1/2 top-[-4px] z-30 flex -translate-x-1/2 gap-[76px]">
          <span className="h-[7px] w-[7px] rounded-full border border-olive bg-cream" />
          <span className="h-[7px] w-[7px] rounded-full border border-olive bg-cream" />
          <span className="h-[7px] w-[7px] rounded-full border border-olive bg-cream" />
        </div>

        {/* Bottom binding */}
        <div className="absolute bottom-[-4px] left-1/2 z-30 flex -translate-x-1/2 gap-[76px]">
          <span className="h-[7px] w-[7px] rounded-full border border-olive bg-cream" />
          <span className="h-[7px] w-[7px] rounded-full border border-olive bg-cream" />
          <span className="h-[7px] w-[7px] rounded-full border border-olive bg-cream" />
        </div>

        {/* Side markers */}
        <span className="absolute left-[-1px] top-[45%] z-30 h-6 w-2 rounded-r-[3px] bg-olive" />
        <span className="absolute right-[-1px] top-[45%] z-30 h-6 w-2 rounded-l-[3px] bg-olive" />

        {/* Content */}
        <div className="relative flex min-h-[270px] flex-col items-center justify-between px-8 py-7 text-center">

          {/* Label */}
       

          {/* Question window */}
          <div className="h-50 w-full overflow-hidden border-y border-olive/30">
            <div className="relative h-full overflow-hidden bg-cream">

              {/* Paper grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(39,58,18,.035) 1px, transparent 1px)",
                  backgroundSize: "56px 100%",
                }}
              />

              {/* Top fade */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[28%] bg-gradient-to-b from-cream via-cream/90 to-transparent" />

              {/* Bottom fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[28%] bg-gradient-to-t from-cream via-cream/90 to-transparent" />

              {/* Center markers */}
              <span className="absolute left-4 top-1/2 z-20 h-px w-4 -translate-y-1/2 bg-olive shadow-[0_0_7px_rgba(96,108,56,0.35)]" />

              <span className="absolute right-4 top-1/2 z-20 h-px w-4 -translate-y-1/2 bg-olive shadow-[0_0_7px_rgba(96,108,56,0.35)]" />

              {/* Reel */}
              <div
                key={animationKey}
                className={`
                  relative flex h-full flex-col items-center justify-center
                  ${
                    spinning
                      ? "animate-[hero-reel-roll_120ms_cubic-bezier(0.22,0.9,0.38,1)_both]"
                      : ""
                  }
                `}
              >

                {/* Previous */}
                <div className="flex h-12 w-full items-center justify-center overflow-hidden px-10 text-center font-serif text-sm leading-none text-olive/45">
                  {previousQuestion}
                </div>

                {/* Current */}
                <div className="relative flex h-[82px] w-full items-center justify-center overflow-hidden border-y border-olive/25 px-8">

                  <div className="absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-olive/25 to-transparent" />

                  <h2 className="max-w-[90%] font-serif text-[clamp(20px,2vw,28px)] font-normal leading-[1.05] tracking-[-0.02em] text-forest">
                    {currentQuestion}
                  </h2>

                  <div className="absolute inset-x-[8%] bottom-0 h-px bg-gradient-to-r from-transparent via-olive/25 to-transparent" />
                </div>

                {/* Next */}
                <div className="flex h-12 w-full items-center justify-center overflow-hidden px-10 text-center font-serif text-sm leading-none text-olive/45">
                  {nextQuestion}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className={`
            text-center
          mt-5 flex h-14 w-1/2
          items-center justify-between
          rounded-[5px]
          border border-rust
          bg-rust
          px-6
          text-[11px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-cream
          shadow-[4px_5px_0_#DDA15E]
          transition-all duration-150
          hover:translate-x-[2px]
          hover:translate-y-[2px]
          hover:bg-[#A95E20]
          hover:shadow-[2px_3px_0_#DDA15E]
          active:translate-x-[4px]
          active:translate-y-[5px]
          active:shadow-none
          disabled:cursor-wait
          disabled:opacity-70
        `}
      >
        <span>
          {spinning ? "Picking your challenge..." : "Generate topic"}
        </span>

        <ArrowRight
          size={20}
          strokeWidth={1.6}
        />
      </button>

      {/* Caption */}
      <p className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.08em] text-forest/35">
        One spin. One challenge.
      </p>
    </div>
  );
}