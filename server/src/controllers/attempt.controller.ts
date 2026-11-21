import type { Request, Response } from "express";

import {
  completeAttempt,
  finishResearch,
  getAttempt,
  submitAttempt,
  submitAudioAttempt,
  getAttemptHistory
} from "../services/attempt.service.js";
import { evaluateAttempt } from "../services/evaluation.service.js";

import { submitAttemptSchema } from "../validator/attempt.validator.js";

import { transcribeAudio } from "../services/transcription.service.js";

import { getUserStreak } from "../services/streak.service.js";

import { unlink } from "fs/promises";

import { getAttemptForSubmission } from "../services/attempt.service.js";

import {
  getRealtimeTranscript,
  deleteRealtimeTranscript,
} from "../services/realtime-transcript.store.js";

type AttemptParams = {
  attemptId: string;
};

export const complete = async (
  req: Request<AttemptParams>,
  res: Response
) => {
  const { attemptId } = req.params;

  const user = res.locals.user;

  const attempt = await completeAttempt(
    attemptId,
    user.id
  );

  res.status(200).json({
    success: true,
    data: attempt,
  });
};

export const finishResearchController = async (
  req: Request<AttemptParams>,
  res: Response
) => {
  const { attemptId } = req.params;

  const user = res.locals.user;

  const attempt = await finishResearch(
    attemptId,
    user.id
  );

  res.status(200).json({
    success: true,
    data: attempt,
  });
};

export const getAttemptController = async (
  req: Request<AttemptParams>,
  res: Response
) => {
  try {
    const { attemptId } = req.params;

    const user = res.locals.user;

    const attempt = await getAttempt(
      attemptId,
      user.id
    );

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error(
      "Failed to load attempt:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "ATTEMPT_NOT_FOUND"
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: "ATTEMPT_NOT_FOUND",
          message: "Challenge not found.",
        },
      });

      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to load challenge.",
      },
    });
  }
};

export const submit = async (
  req: Request<AttemptParams>,
  res: Response
) => {
  const { attemptId } = req.params;

  const user = res.locals.user;

  const { transcript } =
    submitAttemptSchema.parse(req.body);

  const attempt = await submitAttempt(
    attemptId,
    user.id,
    transcript
  );

  res.status(200).json({
    success: true,
    data: attempt,
  });
};





export const submitAudio = async (
  req: Request<AttemptParams>,
  res: Response
) => {
  const controllerStart = performance.now();

  const { attemptId } = req.params;
  const user = res.locals.user;
  const processingAttempts = new Set<string>();
  const submissionKey = `${user.id}:${attemptId}`;

  let needsCleanup = Boolean(req.file);
  let acquiredLock = false;

  try {
    /*
     * Prevent duplicate concurrent submissions.
     */

    if (processingAttempts.has(submissionKey)) {
      res.status(409).json({
        success: false,
        error: {
          code: "SUBMISSION_IN_PROGRESS",
          message: "Attempt is already being processed",
        },
      });

      return;
    }

    processingAttempts.add(submissionKey);
    acquiredLock = true;

    /*
     * 1. Validate attempt
     */

    const validationStart = performance.now();

    let attempt = await getAttemptForSubmission(
      attemptId,
      user.id
    );

    console.log(
      "[PERF] Attempt validation:",
      (performance.now() - validationStart).toFixed(2),
      "ms"
    );

    /*
     * 2. Recover previously submitted attempts
     */

    if (
      attempt.stage === "SUBMITTED" &&
      attempt.status === "COMPLETED"
    ) {
      if (!attempt.transcript) {
        throw new Error(
          "Submitted attempt has no transcript"
        );
      }

      console.log(
        "[SUBMISSION] Resuming existing submission"
      );

      deleteRealtimeTranscript(attemptId, user.id);

      const evaluation =
        attempt.evaluation ??
        await evaluateAttempt(
          attemptId,
          user.id,
          attempt
        );

      res.status(200).json({
        success: true,
        data: {
          attemptId,
          transcript: attempt.transcript,
          evaluation,
        },
      });

      return;
    }

    /*
     * 3. Validate attempt state
     */

    if (
      attempt.stage !== "SPEAKING" ||
      attempt.status !== "IN_PROGRESS"
    ) {
      res.status(409).json({
        success: false,
        error: {
          code: "INVALID_ATTEMPT_STATE",
          message: "Attempt is not in the speaking phase",
        },
      });

      return;
    }

    /*
     * 4. Check server-side realtime transcript
     */

    const cachedTranscript = getRealtimeTranscript(
      attemptId,
      user.id
    );

    let transcript: string;

    let speakingEndedAt = new Date();

    let transcriptionSource:
      | "realtime"
      | "audio";

    /*
     * 5. Realtime transcription successful
     */

    if (cachedTranscript) {
      transcript = cachedTranscript.transcript;

      speakingEndedAt =
        cachedTranscript.speakingEndedAt;

      transcriptionSource = "realtime";

      console.log(
        "[TRANSCRIPTION] Using cached realtime transcript"
      );

      console.log(
        "[PERF] Traditional transcription skipped"
      );
    }

    /*
     * 6. Fallback transcription
     */

    else {
      if (!req.file) {
        res.status(409).json({
          success: false,
          error: {
            code: "REALTIME_TRANSCRIPT_UNAVAILABLE",
            message: "Please submit the recorded audio",
          },
        });

        return;
      }

      console.log(
        "[TRANSCRIPTION] Using audio fallback"
      );

      transcriptionSource = "audio";

      const transcriptionStart = performance.now();

      // transcribeAudio handles file cleanup.
      needsCleanup = false;

      transcript = await transcribeAudio(req.file);

      console.log(
        "[PERF] Audio transcription:",
        (performance.now() - transcriptionStart).toFixed(2),
        "ms"
      );
    }

    if (!transcript.trim()) {
      res.status(422).json({
        success: false,
        error: {
          code: "EMPTY_TRANSCRIPT",
          message: "No speech was detected",
        },
      });

      return;
    }

    /*
     * 7. Persist transcript
     */

    const saveStart = performance.now();

    attempt = await submitAudioAttempt(
      attemptId,
      user.id,
      transcript,
      speakingEndedAt
    );

    // Database now owns the transcript.
    deleteRealtimeTranscript(attemptId, user.id);

    console.log(
      "[PERF] Submit attempt DB update:",
      (performance.now() - saveStart).toFixed(2),
      "ms"
    );

    /*
     * 8. Evaluate attempt
     */

    const evaluationStart = performance.now();

    const evaluation = await evaluateAttempt(
      attemptId,
      user.id,
      attempt
    );

    console.log(
      "[PERF] Complete evaluation service:",
      (performance.now() - evaluationStart).toFixed(2),
      "ms"
    );

    console.log(
      "[SUBMISSION] Transcription source:",
      transcriptionSource
    );

    res.status(200).json({
      success: true,
      data: {
        attemptId,
        transcript: attempt.transcript,
        evaluation,
        transcriptionSource,
      },
    });

  } catch (error) {
    console.error("SUBMIT AUDIO ERROR:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "AUDIO_SUBMISSION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to process audio",
      },
    });

  } finally {
    if (acquiredLock) {
      processingAttempts.delete(submissionKey);
    }

    if (needsCleanup && req.file) {
      try {
        await unlink(req.file.path);
      } catch (error) {
        console.error(
          "Audio cleanup failed:",
          error
        );
      }
    }

    console.log(
      "[PERF] Total controller processing:",
      (performance.now() - controllerStart).toFixed(2),
      "ms"
    );
  }
};



export const getHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const user = res.locals.user;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAttemptHistory(
      user.id,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET HISTORY ERROR:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "HISTORY_FETCH_FAILED",
        message: "Failed to fetch attempt history",
      },
    });
  }
};



export const getStreakController = async (
  _req: Request,
  res: Response
) => {
  try {
    res.setHeader("Cache-Control", "no-store");

    const user = res.locals.user;

    if (!user?.id) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Please sign in to view your streak.",
        },
      });
      return;
    }

    const streak = await getUserStreak(user.id);

    res.status(200).json({
      success: true,
      data: streak,
    });
  } catch (error) {
    console.error("GET STREAK ERROR:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "STREAK_FETCH_FAILED",
        message: "Unable to fetch your practice streak.",
      },
    });
  }
};

