import type { Request, Response } from "express";
import { completeAttempt } from "../services/attempt.service.js";

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