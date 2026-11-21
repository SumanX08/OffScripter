import { useCallback, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedApi } from "./useAuthApi";
import type { EvaluationStage } from "../components/ui/EvaluationLoader";

type Options = {
  attemptId: string | undefined;
  stopRecording: () => Promise<Blob>;
  stopTranscription: () => Promise<string | null | undefined>;
  stopMicrophone: () => void;
  setError: (message: string) => void;
};
export function useSpeakingSubmission({attemptId, stopRecording, stopTranscription, stopMicrophone, setError}: Options) {
 const api = useAuthenticatedApi();
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [ending, setEnding] = useState(false);
 const [finalized, setFinalized] = useState(false);
 const [evaluationStage, setEvaluationStage] = useState<EvaluationStage>("finalizing");
 const submittedRef = useRef(false);
 const finalAudioBlobRef = useRef<Blob | null>(null);
 const realtimeAvailableRef = useRef(false);
 const handleEndSession = useCallback(async () => {
  if (
    !attemptId ||
    ending ||
    submittedRef.current
  ) {
    return;
  }

  const submissionStart = performance.now();

  try {
    setEnding(true);
    setEvaluationStage("finalizing");
    setError("");

    submittedRef.current = true;

    /*
     * Finalize recording only once.
     * Retain the audio blob for potential retries.
     */

    if (!finalAudioBlobRef.current) {
      const [audioBlob, realtimeTranscript] =
        await Promise.all([
          stopRecording(),

          stopTranscription().catch((error) => {
            console.error(
              "[REALTIME] Finalization failed:",
              error
            );

            return null;
          }),
        ]);

      finalAudioBlobRef.current = audioBlob;
      setFinalized(true);

      realtimeAvailableRef.current =
        Boolean(realtimeTranscript?.trim());

      stopMicrophone();
    }

    const audioBlob = finalAudioBlobRef.current;

    /*
     * Audio fallback helper
     */

    const submitFallbackAudio = async () => {
        setEvaluationStage("uploading");

      if (!audioBlob || audioBlob.size === 0) {
        throw new Error(
          "No audio was recorded. Please try again."
        );
      }

      const formData = new FormData();

      const filename = audioBlob.type.includes("mp4")
        ? "speaking.mp4"
        : "speaking.webm";

      formData.append(
        "audio",
        audioBlob,
        filename
      );

      console.log(
        "[SUBMISSION] Uploading backup audio"
      );
      return api.post(
        `/attempts/${attemptId}/submit-audio`,
        formData
      );
    };

    /*
     * Submit using server-side realtime transcript.
     */

    if (realtimeAvailableRef.current) {
      try {
        console.log(
          "[SUBMISSION] Using realtime transcript"
        );

        setEvaluationStage("analyzing");
        await api.post(
          `/attempts/${attemptId}/submit-audio`,
          {}
        );

      } catch (error) {
        const errorCode = isAxiosError(error)
          ? error.response?.data?.error?.code
          : undefined;

        /*
         * Fallback only when the backend explicitly
         * confirms the transcript is unavailable.
         */

        if (
          errorCode === "REALTIME_TRANSCRIPT_UNAVAILABLE"
        ) {
          console.warn(
            "[SUBMISSION] Cached transcript unavailable"
          );

          realtimeAvailableRef.current = false;

          await submitFallbackAudio();

        } else {
          throw error;
        }
      }

    } else {
      await submitFallbackAudio();
    }

    console.log(
      "[PERF] End session to results:",
      (performance.now() - submissionStart).toFixed(2),
      "ms"
    );

    /*
     * Refresh cached data without delaying navigation.
     */

    void Promise.allSettled([
      queryClient.invalidateQueries({
        queryKey: ["streak"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["attempt-history"],
      }),
    ]);

    finalAudioBlobRef.current = null;

    navigate(
      `/challenge/${attemptId}/results`,
      {
        replace: true,
      }
    );

  } catch (error) {
    console.error(
      "Failed to submit recording:",
      error
    );

    submittedRef.current = false;

    setError(
      error instanceof Error
        ? error.message
        : "We couldn't submit your recording. Please try again."
    );

    setEnding(false);
  }

}, [
  api,
  attemptId,
  ending,
  navigate,
  stopMicrophone,
  stopRecording,
  stopTranscription,
  queryClient,
  setError,
]);
 return {ending, finalized, evaluationStage, handleEndSession, submittedRef};
}
