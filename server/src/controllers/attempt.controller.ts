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
  try {
    const { attemptId } = req.params;
    const user = res.locals.user;

    console.log("SUBMIT AUDIO REQUEST", {
      attemptId,
      userId: user.id,
      hasFile: Boolean(req.file),
    });

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: "AUDIO_REQUIRED",
          message: "Audio recording is required",
        },
      });
      return;
    }

    console.log("AUDIO FILE RECEIVED", {
      path: req.file.path,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // 1. Convert speech → text
    const transcript = await transcribeAudio(req.file);

    console.log("TRANSCRIPT:", transcript);

    // 2. Save transcript and mark attempt submitted
    await submitAudioAttempt(
      attemptId,
      user.id,
      transcript
    );

    console.log("TRANSCRIPT SAVED");

    // 3. Evaluate transcript with AI
    const evaluation = await evaluateAttempt(
      attemptId,
      user.id
    );

    console.log("EVALUATION CREATED", {
      evaluationId: evaluation.id,
      overallScore: evaluation.overallScore,
    });

    // 4. Return everything needed by results page
    res.status(200).json({
      success: true,
      data: {
        attemptId,
        transcript,
        evaluation,
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