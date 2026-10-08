type SpinInfoProps = {
  spinning: boolean;
  selectedTopic?: string;
};

export default function SpinInfo({
  spinning,
  selectedTopic,
}: SpinInfoProps) {
  return (
    <div className="rounded-2xl border border-forest/10 bg-[#FFFDF4] p-8 text-center md:p-10">
      {selectedTopic ? (
        <>
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
        </>
      ) : (
        <>
          <h2 className="font-serif text-2xl font-bold text-forest">
            {spinning ? "Choosing your topic..." : "Hit spin."}
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-forest/55">
            You'll get 2 minutes to research, then 2 minutes to explain.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "React",
              "Node.js",
              "MongoDB",
              "PostgreSQL",
              "Redis",
              "WebSockets",
              "System Design",
              "Docker",
              "Kubernetes",
              "DSA",
              "AI / ML",
              "Operating Systems",
            ].map((topic) => (
              <span
                key={topic}
                className="rounded-md bg-[#E9EACF] px-2.5 py-1 text-xs font-medium text-forest/80"
              >
                {topic}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}