
import type { Request, Response } from "express";
import { ZodError } from "zod";
import { spinTopicSchema } from "../validator/topic.validator.js";
import { spinChallenge } from "../services/topic.service.js";

export const spin = async (req: Request, res: Response) => {
  try {
    const filters = spinTopicSchema.parse(req.body ?? {});
    const user = res.locals.user;

   
    if (!user?.id) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Please sign in to spin a topic.",
        },
      });
      return;
    }

    const { attempt, topic } = await spinChallenge(
      filters,
      user.id
    );


    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt.id,
        topic,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
  if (error.message === "FREE_DAILY_LIMIT_REACHED") {
    res.status(429).json({
      success: false,
      error: {
        code: "FREE_DAILY_LIMIT_REACHED",
        message:
          "You've exhausted your free daily topics. Upgrade to Pro for more topics.",
      },
    });
    return;
  }

  if (error.message === "PRO_DAILY_LIMIT_REACHED") {
    res.status(429).json({
      success: false,
      error: {
        code: "PRO_DAILY_LIMIT_REACHED",
        message:
          "You've used all your daily topics. Your limit resets tomorrow. Come back tomorrow!",
      },
    });
    return;
  }
}

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FILTERS",
          message: "The topic filters provided are invalid.",
          details: error.issues,
        },
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message ===
        "No topics available for the selected filters"
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: "NO_TOPICS_AVAILABLE",
          message: error.message,
        },
      });
      return;
    }

    console.error("TOPIC SPIN ERROR:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "TOPIC_SPIN_FAILED",
        message: "Unable to spin a topic. Please try again.",
      },
    });
  }
};
