import type { Evaluation } from "./ProgressSnapshot";

export type RecentAttemptData = {
  id: string;
  submittedAt: string | null;
  createdAt: string;
  topic: {
    title: string;
    category: string;
    difficulty: string;
  };
  evaluation: Evaluation | null;
};

type RecentAttemptProps = {
  attempt: RecentAttemptData | null;
  loading?: boolean;
  onViewResults: (id: string) => void;
  onViewAll: () => void;
};

export default function RecentAttempt({
  attempt,
  loading = false,
  
}: RecentAttemptProps) {
  return (
    <section className="border border-forest/15 bg-[#FFFDF0] p-6 md:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-rust">
            Recent
          </p>
          <h2 className="font-serif text-2xl font-bold">Last attempt</h2>
        </div>

        {attempt?.evaluation && (
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-[#E8ECCB] font-serif text-2xl font-bold text-olive">
            {Math.round(attempt.evaluation.overallScore)}
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-sm text-forest/50">
          Loading your latest attempt...
        </p>
      ) : !attempt ? (
        <div className="py-5">
          <p className="font-serif text-xl font-bold">No attempts yet</p>
          <p className="mt-2 text-sm leading-6 text-forest/55">
            Complete your first challenge and your latest attempt will appear
            here.
          </p>
        </div>
      ) : (
        <>
          <h3 className="font-serif text-2xl font-bold">
            {attempt.topic.title}
          </h3>

          

          {attempt.evaluation?.feedback && (
            <blockquote className="mt-7 border-l-2 border-rust bg-[#FAF0D8] px-5 py-4 text-sm leading-6 text-forest/65">
              “{attempt.evaluation.feedback}”
            </blockquote>
          )}

         
        </>
      )}

      
    </section>
  );
}



