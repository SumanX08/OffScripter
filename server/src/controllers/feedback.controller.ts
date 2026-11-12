
import type { Request, Response } from "express";
import { ZodError } from "zod";

import {
  createFeedbackSchema,
  updateFeedbackStatusSchema,
} from "../validator/feedback.validator.js";

import {
  createFeedback,
  getUserFeedback,
  getAllFeedback,
  updateFeedback,
} from "../services/feedback.service.js";

// Submit feedback
export const submitFeedback = async (
  req: Request,
  res: Response
) => {
  try {
    const input = createFeedbackSchema.parse(req.body);
    
    const user = res.locals.user;

    if (!user?.id) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Please sign in.",
        },
      });
      return;
    }

    const feedback = await createFeedback({
      userId: user.id,
      ...input,
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      data: feedback,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FEEDBACK",
          message: "Please check your feedback details.",
          details: error.issues,
        },
      });
      return;
    }

    throw error;
  }
};

// Get feedback submitted by the authenticated user
export const listMyFeedback = async (
  _req: Request,
  res: Response
) => {
  const user = res.locals.user;

  if (!user?.id) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Please sign in.",
      },
    });
    return;
  }

  const feedback = await getUserFeedback(user.id);

  res.status(200).json({
    success: true,
    data: feedback,
  });
};

// Get all feedback (admin only)
export const listAllFeedback = async (
  _req: Request,
  res: Response
) => {
  const feedback = await getAllFeedback();

  res.status(200).json({
    success: true,
    data: feedback,
  });
};

// Update feedback status (admin only)
export const changeFeedbackStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const feedbackId = req.params.id;

    if (typeof feedbackId !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FEEDBACK_ID",
          message: "Invalid feedback ID.",
        },
      });
      return;
    }

    const input = updateFeedbackStatusSchema.parse(req.body);

    const feedback = await updateFeedback(
      feedbackId,
      input.status,
      input.adminResponse
    );

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully.",
      data: feedback,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FEEDBACK_UPDATE",
          message: "Invalid feedback update.",
          details: error.issues,
        },
      });
      return;
    }

    throw error;
  }
};
