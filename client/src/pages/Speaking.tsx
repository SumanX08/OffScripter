import { useCallback, useEffect, useRef, useState } from "react";

import {
  Pause,
  Play,
  Square,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuthenticatedApi } from "../hooks/useAuthApi";

type AttemptResponse = {
  id: string;

  status:
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ABANDONED";

  stage:
    | "RESEARCHING"
    | "SPEAKING"
    | "SUBMITTED";

  speakingStartedAt: string | null;

  topic: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    researchTime: number;
    speakingTime: number;
  };
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(remainingSeconds).padStart(
    2,
    "0",
  )}`;
}

const waveformHeights = [
  18, 30, 42, 24, 52, 35, 64, 28,
  45, 72, 38, 58, 30, 68, 46, 24,
  55, 36, 70, 42, 25, 60, 34, 50,
  28, 66, 40, 58, 32, 48, 70, 35,
  52, 26, 62, 40, 72, 30, 54, 38,
];

export default function Speaking() {
  const { attemptId } = useParams<{
    attemptId: string;
  }>();

  const autoSubmitTriggeredRef = useRef(false);

  const api = useAuthenticatedApi();
  const navigate = useNavigate();

  const [attempt, setAttempt] =
    useState<AttemptResponse | null>(null);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [elapsedTime, setElapsedTime] =
    useState(0);

  const [paused, setPaused] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [ending, setEnding] =
    useState(false);

  const [error, setError] =
    useState("");

  const [recordingReady, setRecordingReady] =
    useState(false);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const mediaStreamRef =
    useRef<MediaStream | null>(null);

  const mediaChunksRef =
    useRef<Blob[]>([]);

  const submittedRef =
    useRef(false);

  /*
   * --------------------------------------------------
   * Get supported recording MIME type
   * --------------------------------------------------
   */

  const getRecordingMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
    ];

    return (
      types.find((type) =>
        MediaRecorder.isTypeSupported(type),
      ) || ""
    );
  };

  /*
   * --------------------------------------------------
   * Start microphone recording
   * --------------------------------------------------
   */

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Your browser does not support microphone recording.",
      );
    }

    if (!("MediaRecorder" in window)) {
      throw new Error(
        "Your browser does not support audio recording.",
      );
    }

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    mediaStreamRef.current = stream;

    const mimeType = getRecordingMimeType();

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    mediaChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        mediaChunksRef.current.push(
          event.data,
        );
      }
    };

    recorder.onerror = () => {
      setError(
        "Something went wrong while recording your voice.",
      );
    };

    recorder.start(1000);

    mediaRecorderRef.current = recorder;

    setRecordingReady(true);
  }, []);

  /*
   * --------------------------------------------------
   * Load attempt
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!attemptId) {
      setError("Speaking session not found.");
      setLoading(false);
      return;
    }

    const loadAttempt = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/attempts/${attemptId}`,
        );

        const data: AttemptResponse =
          response.data.data;

        if (!data) {
          throw new Error(
            "Attempt not found",
          );
        }

        /*
         * Research hasn't finished.
         */

        if (data.stage === "RESEARCHING") {
          navigate(
            `/challenge/${attemptId}/research`,
            {
              replace: true,
            },
          );

          return;
        }

        /*
         * Already submitted.
         */

        if (data.stage === "SUBMITTED") {
          navigate(
            `/challenge/${attemptId}/results`,
            {
              replace: true,
            },
          );

          return;
        }

        setAttempt(data);

        setTimeLeft(
          data.topic.speakingTime,
        );

        setElapsedTime(0);

        /*
         * Start microphone.
         */

        await startRecording();
      } catch (error) {
        console.error(
          "Failed to load speaking challenge:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "We couldn't load this speaking session.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadAttempt();
  }, [
    api,
    attemptId,
    navigate,
    startRecording,
  ]);

  /*
   * --------------------------------------------------
   * Stop microphone stream
   * --------------------------------------------------
   */

  const stopMicrophone = useCallback(() => {
    mediaStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    mediaStreamRef.current = null;
  }, []);

  /*
   * --------------------------------------------------
   * Get final audio blob
   * --------------------------------------------------
   */

  const stopRecording =
    useCallback((): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const recorder =
          mediaRecorderRef.current;

        if (!recorder) {
          reject(
            new Error(
              "Recording was not initialized.",
            ),
          );

          return;
        }

        if (recorder.state === "inactive") {
          const blob = new Blob(
            mediaChunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            },
          );

          resolve(blob);
          return;
        }

        recorder.onstop = () => {
          const blob = new Blob(
            mediaChunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            },
          );

          resolve(blob);
        };

        recorder.onerror = () => {
          reject(
            new Error(
              "Failed to stop the recording.",
            ),
          );
        };

        recorder.stop();
      });
    }, []);

  /*
   * --------------------------------------------------
   * Submit recording
   * --------------------------------------------------
   */

  const handleEndSession =
    useCallback(async () => {
      if (
        !attemptId ||
        ending ||
        submittedRef.current
      ) {
        return;
      }

      try {
        setEnding(true);
        setError("");

        submittedRef.current = true;

        const audioBlob =
          await stopRecording();

        stopMicrophone();

        if (audioBlob.size === 0) {
          throw new Error(
            "No audio was recorded. Please try again.",
          );
        }

        const formData = new FormData();

        formData.append(
          "audio",
          audioBlob,
          "speaking.webm",
        );

        /*
         * Do NOT manually set Content-Type.
         * The browser/Axios will add the multipart boundary.
         */

        await api.post(
          `/attempts/${attemptId}/submit-audio`,
          formData,
        );

        navigate(
          `/challenge/${attemptId}/results`,
          {
            replace: true,
          },
        );
      } catch (error) {
        console.error(
          "Failed to submit recording:",
          error,
        );

        submittedRef.current = false;

        setError(
          error instanceof Error
            ? error.message
            : "We couldn't submit your recording. Please try again.",
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
    ]);

  /*
   * --------------------------------------------------
   * Speaking timer
   * --------------------------------------------------
   */

  useEffect(() => {
    if (
      !attempt ||
      paused ||
      ending ||
      timeLeft <= 0
    ) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setTimeLeft((current) =>
          Math.max(0, current - 1),
        );

        setElapsedTime((current) =>
          current + 1,
        );
      }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    attempt,
    paused,
    ending,
    timeLeft,
  ]);

  /*
   * --------------------------------------------------
   * Auto-submit when timer reaches zero
   * --------------------------------------------------
   */

  useEffect(() => {
  if (
    timeLeft === 0 &&
    attempt &&
    !ending &&
    !paused &&
    recordingReady &&
    !autoSubmitTriggeredRef.current &&
    !submittedRef.current
  ) {
    autoSubmitTriggeredRef.current = true;
    void handleEndSession();
  }
}, [
  timeLeft,
  attempt,
  ending,
  paused,
  recordingReady,
  handleEndSession,
]);

  /*
   * --------------------------------------------------
   * Pause / Resume
   * --------------------------------------------------
   */

  const handlePauseToggle = () => {
    if (
      ending ||
      timeLeft <= 0
    ) {
      return;
    }

    const recorder =
      mediaRecorderRef.current;

    if (!recorder) {
      setError(
        "Recording is not available.",
      );

      return;
    }

    if (
      recorder.state === "recording"
    ) {
      recorder.pause();
      setPaused(true);
      return;
    }

    if (
      recorder.state === "paused"
    ) {
      recorder.resume();
      setPaused(false);
    }
  };

  /*
   * --------------------------------------------------
   * Cleanup
   * --------------------------------------------------
   */

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !==
          "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      stopMicrophone();
    };
  }, [stopMicrophone]);

  /*
   * --------------------------------------------------
   * Loading
   * --------------------------------------------------
   */

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
            onClick={() =>
              navigate("/challenge")
            }
            className="mt-6 rounded-lg bg-[#263911] px-5 py-3 text-sm font-bold text-[#FCF9EC] transition hover:bg-[#30471B]"
          >
            Back to Challenge
          </button>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * Speaking page
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen overflow-hidden bg-[#FCF9EC] text-[#263911]">
      <div className="mx-auto flex min-h-screen w-full max-w-[900px] flex-col items-center px-6 py-10 sm:px-10 sm:py-12">

        {/* Topic */}

        <section className="w-full text-center">
          <h1 className="mx-auto max-w-[800px] font-serif text-4xl leading-[1.02] tracking-[-0.045em] text-[#263911] sm:text-[45px] lg:text-[58px]">
            {attempt.topic.title}
          </h1>
        </section>

        {/* Timer */}

        <section className="mt-10 text-center sm:mt-12">
          <div
            className={[
              "font-serif text-[82px] leading-none tracking-[-0.07em]",
              "sm:text-[110px]",
              "lg:text-[75px]",
              timeLeft <= 10
                ? "text-[#BF681C]"
                : "text-[#263911]",
            ].join(" ")}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Recording status */}

          <div className="mt-8 flex items-center justify-center gap-2">
            <span
              className={[
                "h-3 w-3 rounded-full",
                paused || ending
                  ? "bg-[#9B9179]"
                  : "animate-pulse bg-[#DDA15E]",
              ].join(" ")}
            />

            <span className="text-[16px] font-medium text-[#263911]/55">
              {ending
                ? "Processing..."
                : paused
                  ? "Paused"
                  : "Recording"}
            </span>
          </div>
        </section>

        {/* Waveform */}

        <div
          className={[
            "mt-12 flex h-[90px] items-center justify-center gap-[5px]",
            "sm:mt-14",
            paused || ending
              ? "opacity-30"
              : "",
          ].join(" ")}
          aria-hidden="true"
        >
          {waveformHeights.map(
            (height, index) => (
              <span
                key={index}
                className={[
                  "w-[4px] rounded-full bg-[#BF681C]",
                  !paused && !ending
                    ? "animate-[wave_900ms_ease-in-out_infinite]"
                    : "",
                ].join(" ")}
                style={{
                  height: `${height}%`,
                  animationDelay: `${
                    index * 35
                  }ms`,
                }}
              />
            ),
          )}
        </div>

        {/* Controls */}

        <div className="mt-12 flex items-center justify-center gap-5 sm:mt-14 sm:gap-6">

          {/* Pause */}

          <button
            type="button"
            onClick={
              handlePauseToggle
            }
            disabled={
              timeLeft === 0 ||
              ending ||
              !recordingReady
            }
            aria-label={
              paused
                ? "Resume speaking"
                : "Pause speaking"
            }
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E9EDC9] text-[#263911] shadow-[0_8px_20px_rgba(35,49,17,0.06)] transition hover:scale-105 hover:bg-[#E1E7BD] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[62px] sm:w-[62px]"
          >
            {paused ? (
              <Play
                size={19}
                fill="currentColor"
              />
            ) : (
              <Pause
                size={19}
                fill="currentColor"
              />
            )}
          </button>

          {/* Stop */}

          <button
            type="button"
            onClick={
              handleEndSession
            }
            disabled={
              ending ||
              !recordingReady
            }
            aria-label="End speaking session"
            className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#BF681C] text-white shadow-[0_14px_30px_rgba(191,104,28,0.22)] transition hover:scale-[1.04] hover:bg-[#AD5B16] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[102px] sm:w-[102px]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-white">
              <Square
                size={15}
                fill="#BF681C"
                strokeWidth={0}
              />
            </span>
          </button>

          {/* Elapsed */}

          <span className="min-w-[48px] text-left font-mono text-[14px] text-[#263911]/35">
            {formatTime(elapsedTime)}
          </span>
        </div>

        {/* Error */}

        {error && (
          <p className="mt-8 max-w-md text-center text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}