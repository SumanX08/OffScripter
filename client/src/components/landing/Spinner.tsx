import { useState } from "react";
import { ArrowDownRight, CircleDot } from "lucide-react";

const topics = [
  "React",
  "Node.js",
  "Redis",
  "WebSockets",
  "Databases",
  "System Design",
  "DevOps",
  "DSA",
  "AI / ML",
  "Operating Systems",
];

export default function Spinner() {
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState("Spin for a topic");
  const [spinning, setSpinning] = useState(false);

  function spin() {
    if (spinning) return;

    const topicIndex = Math.floor(Math.random() * topics.length);

    setSpinning(true);
    setSelected("Picking your challenge...");

    setRotation(
      (value) => value + 1440 + (360 - topicIndex * 36)
    );

    window.setTimeout(() => {
      setSelected(topics[topicIndex]);
      setSpinning(false);
    }, 1600);
  }

  return (
    <div className="spinner-stage">
      {/* Floating topic notes */}
      <div className="topic-note note-one">
        Explain Redis Pub/Sub
      </div>

      <div className="topic-note note-two">
        How do WebSockets work?
      </div>

      <div className="topic-note note-three">
        Explain Docker
      </div>

      <div className="topic-note note-four">
        REST vs GraphQL
      </div>

      <div className="wheel-wrap">
        <div className="wheel-pointer" aria-hidden="true" />

        <div
          className="topic-wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
          aria-label="Technical topic wheel"
        >
          {topics.map((topic, index) => (
            <span
              key={topic}
              className={`wheel-label wheel-label-${index + 1}`}
            >
              {topic}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="spin-button"
          onClick={spin}
          disabled={spinning}
          aria-label="Spin for a random topic"
        >
          <span>SPIN</span>
          <ArrowDownRight size={17} />
        </button>
      </div>

      <p className="spinner-result" aria-live="polite">
        <CircleDot size={15} />
        {selected}
      </p>
    </div>
  );
}