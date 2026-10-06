import type { Request, Response } from "express";
import { evaluateAttempt } from "../services/evaluation.service.js";

type AttemptParams = {
  attemptId: string;
};

export const evaluate = async (
  req: Request<AttemptParams>,
  res: Response
) => {
  const { attemptId } = req.params;
  const user = res.locals.user;

  const evaluation = await evaluateAttempt(
    attemptId,
    user.id
  );

  res.status(200).json({
    success: true,
    data: evaluation,
  });
};