import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

type TopicWheelProps = {
  spinning: boolean;
  selectedTopic?: string | null;
  onSpin: () => void;
  onAnimationComplete: () => void;
};

const reelQuestions = [
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

export default function TopicWheel({
  spinning,
  selectedTopic,
  onSpin,
  onAnimationComplete,
}: TopicWheelProps) {
  const [activeQuestion, setActiveQuestion] = useState(
    reelQuestions[0],
  );

  const [reelTick, setReelTick] = useState(0);

  const activeQuestionRef = useRef(activeQuestion);

  const selectedTopicRef = useRef<string | null | undefined>(
    selectedTopic,
  );

  const callbackRef = useRef(onAnimationComplete);

  const animationIdRef = useRef(0);

  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  }, [activeQuestion]);

  useEffect(() => {
    selectedTopicRef.current = selectedTopic;
  }, [selectedTopic]);

  useEffect(() => {
    callbackRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  /*
   * SPIN ANIMATION
   *
   * Fast → faster → medium → slow → settle.
   *
   * Every step changes the question and increments
   * reelTick. The reel content is remounted and
   * slides vertically into its new position.
   */
  useEffect(() => {
    if (!spinning) {
      return;
    }

    const animationId = ++animationIdRef.current;

    let cancelled = false;
    let step = 0;

    const currentIndex = reelQuestions.indexOf(
      activeQuestionRef.current,
    );

    const startIndex =
      currentIndex === -1 ? 0 : currentIndex;

    const runAnimation = () => {
      if (
        cancelled ||
        animationId !== animationIdRef.current
      ) {
        return;
      }

      /*
       * Once the normal reel sequence has finished,
       * DO NOT stop the animation yet.
       *
       * Wait for the real backend topic.
       */
      if (step >= 13) {
        const finalQuestion = selectedTopicRef.current;

        if (!finalQuestion) {
          /*
           * Backend is still generating the topic.
           *
           * Keep the reel moving slowly so it
           * never looks like it has stopped.
           */
          const nextIndex =
            (startIndex + step) % reelQuestions.length;

          setActiveQuestion(reelQuestions[nextIndex]);

          setReelTick((tick) => tick + 1);

          step += 1;

          window.setTimeout(runAnimation, 180);

          return;
        }

        /*
         * Backend topic is ready.
         *
         * This is the ONLY place where we
         * transition to the actual question.
         */
        setActiveQuestion(finalQuestion);

        setReelTick((tick) => tick + 1);

        /*
         * Wait for the final landing animation.
         */
        window.setTimeout(() => {
          if (!cancelled) {
            callbackRef.current();
          }
        }, 280);

        return;
      }

      /*
       * Normal reel movement.
       */
      const nextIndex =
        (startIndex + step + 1) % reelQuestions.length;

      setActiveQuestion(reelQuestions[nextIndex]);

      setReelTick((tick) => tick + 1);

      step += 1;

      /*
       * Fast → medium → slow.
       */
      const delay =
        step <= 6
          ? 58
          : step <= 9
            ? 82
            : step <= 12
              ? 125
              : 175;

      window.setTimeout(runAnimation, delay);
    };

    runAnimation();

    return () => {
      cancelled = true;
    };
  }, [spinning]);

  /*
   * Current reel position.
   */
  const activeIndex = (() => {
    const index = reelQuestions.indexOf(activeQuestion);

    return index === -1 ? 0 : index;
  })();

  const previousQuestion =
    reelQuestions[
      (activeIndex - 1 + reelQuestions.length) %
        reelQuestions.length
    ];

  const nextQuestion =
    reelQuestions[
      (activeIndex + 1) % reelQuestions.length
    ];

  /*
   * During the spin:
   *   show the local reel questions.
   *
   * After the spin:
   *   show the actual backend question.
   */
  const displayQuestion =
    spinning || !selectedTopic
      ? activeQuestion
      : selectedTopic;

  return (
    <div className="mx-auto w-full max-w-[620px]">
      {/* Reel */}
      <div
        className={[
          "relative w-full overflow-hidden",
          "rounded-[3px]",
          "border border-[#283618]/40",
          "bg-[#FAEDCD]",
          "shadow-[8px_10px_0_rgba(204,213,174,0.7),0_22px_45px_rgba(40,54,24,0.13)]",
          "transition-all duration-300",

          spinning
            ? "shadow-[8px_10px_0_rgba(204,213,174,0.7),0_22px_45px_rgba(96,108,56,0.16)]"
            : "",

          !spinning && selectedTopic
            ? "animate-[reel-settle_280ms_cubic-bezier(0.22,0.9,0.38,1)_both]"
            : "",
        ].join(" ")}
      >
        {/* Inner paper border */}
        <div className="pointer-events-none absolute inset-2 z-10 border border-[#283618]/20" />

        {/* Top binding */}
        <div className="absolute left-1/2 top-[-4px] z-20 flex -translate-x-1/2 gap-[76px]">
          <span className="h-[7px] w-[7px] rounded-full border border-[#606C38] bg-[#FEFAE0]" />
          <span className="h-[7px] w-[7px] rounded-full border border-[#606C38] bg-[#FEFAE0]" />
          <span className="h-[7px] w-[7px] rounded-full border border-[#606C38] bg-[#FEFAE0]" />
        </div>

        {/* Bottom binding */}
        <div className="absolute bottom-[-4px] left-1/2 z-20 flex -translate-x-1/2 gap-[76px]">
          <span className="h-[7px] w-[7px] rounded-full border border-[#606C38] bg-[#FEFAE0]" />
          <span className="h-[7px] w-[7px] rounded-full border border-[#606C38] bg-[#FEFAE0]" />
          <span className="h-[7px] w-[7px] rounded-full border border-[#606C38] bg-[#FEFAE0]" />
        </div>

        {/* Side markers */}
        <span className="absolute left-[-1px] top-[45%] z-30 h-6 w-2 rounded-[3px] bg-[#606C38] shadow-[0_0_14px_rgba(96,108,56,0.35)]" />

        <span className="absolute right-[-1px] top-[45%] z-30 h-6 w-2 rounded-[3px] bg-[#606C38] shadow-[0_0_14px_rgba(96,108,56,0.35)]" />

        {/* Reel content */}
        <div className="relative flex min-h-[240px] flex-col items-center justify-between px-[46px] py-[26px] text-center">
          {/* Label */}

          {/* Window */}
          <div className="h-63 w-full overflow-hidden border-y border-[#606C38]/40">
            <div className="relative h-full overflow-hidden rounded-[1px] bg-[#FEFAE0]">
              {/* Vertical paper grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(39,58,18,.035) 1px, transparent 1px)",
                  backgroundSize: "56px 100%",
                }}
              />

              {/* Top fade */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[25%] bg-gradient-to-b from-[#FEFAE0] via-[#FEFAE0]/90 to-transparent" />

              {/* Bottom fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[25%] bg-gradient-to-t from-[#FEFAE0] via-[#FEFAE0]/90 to-transparent" />

              {/* Center markers */}
              <span className="absolute left-5 top-1/2 z-20 h-px w-[17px] -translate-y-1/2 bg-[#606C38] shadow-[0_0_7px_rgba(96,108,56,0.45)]" />

              <span className="absolute right-5 top-1/2 z-20 h-px w-[17px] -translate-y-1/2 bg-[#606C38] shadow-[0_0_7px_rgba(96,108,56,0.45)]" />

              {/* Question reel */}
              <div
                key={reelTick}
                className={[
                  /*
                   * IMPORTANT:
                   *
                   * We no longer use reel-jitter.
                   *
                   * Every new question enters from
                   * slightly below and slides into
                   * the center, creating the physical
                   * reel movement.
                   */
                  "relative flex h-full flex-col items-center justify-center",

                  spinning
                    ? "animate-[reel-roll_110ms_cubic-bezier(0.22,0.9,0.38,1)_both]"
                    : "",
                ].join(" ")}
              >
                {/* Previous */}
                <div className="flex h-[42px] w-full items-center justify-center overflow-hidden px-10 text-center font-serif text-[16px] leading-none text-[#606C38]/50 opacity-60">
                  {previousQuestion}
                </div>

                {/* Current */}
                <div className="relative flex h-20 w-full items-center justify-center overflow-hidden border-y border-[#606C38]/30 px-4">
                  {/* Top line */}
                  <div className="absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-[#606C38]/30 to-transparent" />

                  {/* Question */}
                  <h2 className="max-w-[92%] font-serif text-[clamp(21px,2vw,30px)] font-normal leading-none tracking-[-0.02em] text-[#283618]">
                    {displayQuestion}
                  </h2>

                  {/* Bottom line */}
                  <div className="absolute inset-x-[8%] bottom-0 h-px bg-gradient-to-r from-transparent via-[#606C38]/30 to-transparent" />
                </div>

                {/* Next */}
                <div className="flex h-[42px] w-full items-center justify-center overflow-hidden px-10 text-center font-serif text-[16px] leading-none text-[#606C38]/50 opacity-60">
                  {nextQuestion}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate button */}
    <div className="flex justify-center">
        <button
          type="button"
          disabled={spinning}
          onClick={onSpin}
          className={[
            "mt-[22px] inline-flex h-[58px] w-full",
            "items-center justify-between",
            "rounded-[6px]",
            "border border-[#BC6C25]",
            "bg-[#BC6C25]",
            "px-6",
            "text-[11px] font-bold uppercase tracking-[0.12em]",
            "text-[#FEFAE0]",
            "shadow-[4px_5px_0_#DDA15E]",
            "transition-all duration-150",
            "hover:translate-x-[2px] hover:translate-y-[2px]",
            "hover:bg-[#A95E20]",
            "hover:shadow-[2px_3px_0\_#DDA15E]",
            "active:translate-x-[4px] active:translate-y-[5px]",
            "active:shadow-none",
            "disabled:cursor-wait disabled:opacity-70",
          ].join(" ")}
        >
          <span>
            {spinning
              ? "Generating..."
              : "Generate topic"}
          </span>
          <ArrowRight
            size={20}
            strokeWidth={1.6}
          />
        </button>
      </div>

      {/* Caption */}
      <p className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.06em] text-[#283618]/35">
        One spin. One challenge.
      </p>
    </div>
  );
}