import { ArrowRight, BarChart3 } from "lucide-react";

export type Evaluation = {
  overallScore: number;
  technicalAccuracy: number;
  clarity: number;
  structure: number;
  depth: number;
  examples: number;
  conciseness: number;
  fillerWordsCount: number;
  feedback: string;
};

type ProgressSnapshotProps = {
  evaluation: Evaluation | null;
  loading?: boolean;
  onViewProgress: () => void;
};

const ratingMetrics: {
  key: keyof Evaluation;
  label: string;
}[] = [
  { key: "depth", label: "Technical Depth" },
  { key: "technicalAccuracy", label: "Technical Accuracy" },
  { key: "clarity", label: "Clarity" },
  { key: "structure", label: "Structure" },
  { key: "examples", label: "Examples" },
  { key: "conciseness", label: "Conciseness" },
];

export default function ProgressSnapshot({
  evaluation,
  loading = false,
  onViewProgress,
}: ProgressSnapshotProps) {
  return (
    <section className="border border-forest/15 bg-[#FFFDF0] p-6 md:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-rust">
            Your skills
          </p>
          <h2 className="font-serif text-2xl font-bold">
            Progress snapshot
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewProgress}
          className="flex shrink-0 items-center gap-2 pt-1 text-sm font-bold text-olive hover:text-forest"
        >
          Full report <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-sm text-forest/50">
          Loading your progress...
        </p>
      ) : !evaluation ? (
        <div className="py-5">
          <div className="mb-3 grid size-12 place-items-center rounded-full bg-sage/40">
            <BarChart3 size={22} />
          </div>
          <p className="font-semibold">Your progress starts here.</p>
          <p className="mt-2 text-sm leading-6 text-forest/55">
            Complete your first speaking challenge to see your evaluation
            ratings.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {ratingMetrics.map(({ key, label }) => {
            const score = evaluation[key];

            if (typeof score !== "number") return null;

            const safeScore = Math.max(0, Math.min(100, score));

            return (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{label}</span>
                  <span className="font-bold text-olive">{score}</span>
                </div>

                <div
                  className="h-[6px] overflow-hidden bg-[#E3E7CB]"
                  role="progressbar"
                  aria-label={label}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={safeScore}
                >
                  <div
                    className="h-full bg-olive transition-[width] duration-500"
                    style={{ width: `${safeScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}