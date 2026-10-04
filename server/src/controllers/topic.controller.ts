import type { Request, Response } from "express";

import { spinTopicSchema } from "../validator/topic.validator.js";
import { spinChallenge } from "../services/topic.service.js";

export const spin = async (
  req: Request,
  res: Response
) => {
  const filters = spinTopicSchema.parse(req.body ?? {});

  const { attempt, topic } = await spinChallenge(filters);

  res.status(201).json({
    success: true,
    data: {
      attemptId: attempt.id,
      topic,
    },
  });
};