import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { useSpeakingSession } from "../hooks/useSpeakingSession";
import EvaluationLoader from "../components/ui/EvaluationLoader";
import SpeakingTimer from "../components/ui/SpeakingTimer";
import SpeakingWaveform from "../components/ui/SpeakingWaveform";
import SpeakingControls from "../components/ui/SpeakingControls";
export default function Speaking() {
  const { attemptId } = useParams<{ attemptId: string }>();
  return <SpeakingSession key={attemptId} />;
}

function SpeakingSession() {
 const {attempt,loading,error,ending,finalized,paused,recordingReady,evaluationStage,timeLeft,elapsedTime,handlePauseToggle,handleEndSession,handleBackToChallenge} = useSpeakingSession();
  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FCF9EC] text-[#263911]">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#263911]/50">
          Preparing your session...
        </p>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * Missing attempt
   * --------------------------------------------------
   */

  if (!attempt) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FCF9EC] px-6 text-[#263911]">
        <div className="text-center">
          <p className="font-serif text-3xl">
            Speaking session unavailable.
          </p>

          <p className="mt-3 max-w-sm text-sm leading-6 text-[#263911]/50">
            {error ||
              "We couldn't find this speaking session."}
          </p>

          <button
            type="button"
            onClick={handleBackToChallenge
            }
            className="mt-6 rounded-lg bg-[#263911] px-5 py-3 text-sm font-bold text-[#FCF9EC] transition hover:bg-[#30471B]"
          >
            Back to Challenge
          </button>
        </div>
      </main>
    );
  }

  if (ending) {
  return (
    <EvaluationLoader stage={evaluationStage} />
  );
}
  return (
    <main className="min-h-screen overflow-hidden bg-[#FCF9EC] text-[#263911]">
<motion.div
  className="mx-auto flex min-h-screen w-full max-w-[900px] flex-col items-center px-6 py-10 sm:px-10 sm:py-12"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.65,
    ease: [0.22, 1, 0.36, 1],
  }}
>
        {/* Topic */}

        <motion.section
  className="w-full text-center"
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.15 }}
>
          <h1 className="mx-auto max-w-[800px] font-serif text-4xl leading-[1.02] tracking-[-0.045em] text-[#263911] sm:text-[45px] lg:text-[58px]">
            {attempt.topic.title}
          </h1>
        </motion.section>
 <SpeakingTimer timeLeft={timeLeft} paused={paused} recordingReady={recordingReady} finalized={finalized} />
 <SpeakingWaveform paused={paused || finalized || !recordingReady} />
 <SpeakingControls paused={paused} timeLeft={timeLeft} elapsedTime={elapsedTime} recordingReady={recordingReady} finalized={finalized} onPauseToggle={handlePauseToggle} onEndSession={handleEndSession} />
        {/* Error */}

        {error && (
  <motion.p
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-8 max-w-md text-center text-xs font-medium text-red-600"
  >
    {error}
  </motion.p>
)}
      </motion.div>
    </main>
  );
}
