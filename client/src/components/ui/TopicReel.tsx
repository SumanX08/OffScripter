import { useEffect, useRef, useState } from "react";

import "./TopicReel.css";

type ReelTopic = {
  name: string;
};

type TopicReelProps = {
  spinning: boolean;
  onSpin: () => void;
  selectedTopic?: string;
  
};

const reelTopics: ReelTopic[] = [
  { name: "React" },
  { name: "Node.js" },
  { name: "MongoDB" },
  { name: "PostgreSQL" },
  { name: "Redis" },
  { name: "WebSockets" },
  { name: "System Design" },
  { name: "Docker" },
  { name: "Kubernetes" },
  { name: "DSA" },
  { name: "AI / ML" },
  { name: "Operating Systems" },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2c.5 6.1 3.9 9.5 10 10-6.1.5-9.5 3.9-10 10-.5-6.1-3.9-9.5-10-10 6.1-.5 9.5-3.9 10-10Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.8v4.5l3 1.7" />
    </svg>
  );
}

type ActionButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

function ActionButton({
  children,
  disabled = false,
  onClick,
  variant = "primary",
}: ActionButtonProps) {
  return (
    <button
      className={`topic-action topic-action--${variant}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      <ArrowIcon />
    </button>
  );
}

export default function TopicReel({
  spinning,
  onSpin,
  selectedTopic,
}: TopicReelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  const [reelTick, setReelTick] = useState(0);

  const timeouts = useRef<number[]>([]);

  const activeTopic = reelTopics[activeIndex];

  const previousTopic =
    reelTopics[
      (activeIndex - 1 + reelTopics.length) % reelTopics.length
    ];

  const nextTopic =
    reelTopics[(activeIndex + 1) % reelTopics.length];

  useEffect(() => {
    return () => {
      timeouts.current.forEach(window.clearTimeout);
    };
  }, []);

  /*
   * The parent handles the actual API call.
   *
   * This function only starts the visual reel animation.
   */
  useEffect(() => {
    if (!spinning) {
      return;
    }

    timeouts.current.forEach(window.clearTimeout);
    timeouts.current = [];

    setHasSelection(false);

    const sequenceLength = 13;

    let elapsed = 0;

    /*
     * Make the reel end on a different visual topic.
     */
    let finalIndex = Math.floor(
      Math.random() * reelTopics.length
    );

    if (finalIndex === activeIndex) {
      finalIndex =
        (finalIndex + 1) % reelTopics.length;
    }

    for (let step = 0; step < sequenceLength; step += 1) {
      /*
       * Fast at the beginning,
       * slower toward the end.
       */
      const delay =
        step < 7
          ? 62
          : 62 + (step - 6) * 42;

      elapsed += delay;

      const timeout = window.setTimeout(() => {
        const nextIndex =
          step === sequenceLength - 1
            ? finalIndex
            : (activeIndex + step + 1) %
              reelTopics.length;

        setActiveIndex(nextIndex);
        setReelTick((tick) => tick + 1);

        if (step === sequenceLength - 1) {
          setHasSelection(true);
        }
      }, elapsed);

      timeouts.current.push(timeout);
    }

    return () => {
      timeouts.current.forEach(window.clearTimeout);
      timeouts.current = [];
    };
  }, [spinning]);

  /*
   * The visual animation is complete.
   *
   * selectedTopic comes from the backend.
   */
  const showChallenge =
    !spinning &&
    hasSelection &&
    Boolean(selectedTopic);

  return (
    <section className="topic-generator">
      {/* Intro */}
      <div className="topic-generator__intro">
        <div className="topic-generator__eyebrow">
          <span>Issue No. 04</span>

          <SparkIcon />

          <span>Topic Reel</span>
        </div>

        <h1>
          Think clearly.
          <br />
          <em>Speak unscripted.</em>
        </h1>

        <p>
          Sharpen your technical communication, one
          thoughtfully chosen challenge at a time.
        </p>
      </div>

      {/* Generator */}
      <div className="topic-generator__layout">
        {/* Left note */}
        <aside
          aria-hidden="true"
          className="topic-margin-note topic-margin-note--left"
        >
          <span>01</span>
          <p>Generate a topic</p>
        </aside>

        <div className="topic-generator__center">
          {/* Reel */}
          <div
            aria-atomic="true"
            aria-live="polite"
            className={`topic-reel ${
              spinning ? "topic-reel--moving" : ""
            }`}
          >
            <div className="reel-binding reel-binding--top">
              <span />
              <span />
              <span />
            </div>

            <div className="reel-content">
              <span className="reel-label">
                Your next challenge
              </span>

              <div className="topic-window">
                <div
                  className={`topic-strip ${
                    spinning
                      ? "topic-strip--moving"
                      : ""
                  }`}
                  key={reelTick}
                >
                  <div className="topic-position topic-position--muted">
                    <span>
                      {previousTopic.name}
                    </span>
                  </div>

                  <div className="topic-position topic-position--current">
                    <h2>{activeTopic.name}</h2>
                  </div>

                  <div className="topic-position topic-position--muted">
                    <span>
                      {nextTopic.name}
                    </span>
                  </div>
                </div>
              </div>

              <span className="reel-edition">
                Developer edition · 2026
              </span>
            </div>

            <div className="reel-binding reel-binding--bottom">
              <span />
              <span />
              <span />
            </div>
          </div>

          {/* Generate */}
          <ActionButton
            disabled={spinning}
            onClick={onSpin}
          >
            {spinning
              ? "Generating..."
              : "Generate topic"}
          </ActionButton>

          {/* Selected challenge */}
          <div
            aria-hidden={!showChallenge}
            className={`challenge-panel ${
              showChallenge
                ? "challenge-panel--visible"
                : ""
            }`}
          >
            <div className="challenge-kicker">
              <span>Selected challenge</span>

              <span className="challenge-number">
                #
                {String(
                  activeIndex + 1
                ).padStart(2, "0")}
              </span>
            </div>

            <h3>
              {selectedTopic}
            </h3>

            <div className="challenge-footer">
              <div className="timings">
                <span>
                  <ClockIcon />
                  2 min research
                </span>

                <span>
                  <ClockIcon />
                  2 min speaking
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right note */}
        <aside
          aria-hidden="true"
          className="topic-margin-note topic-margin-note--right"
        >
          <span>02</span>
          <p>Speak for two minutes</p>
        </aside>
      </div>

      <footer className="topic-generator__footer">
        <span>
          Build confidence, not scripts.
        </span>

        <span className="footer-rule" />

        <span>
          Made for curious developers
        </span>
      </footer>
    </section>
  );
}