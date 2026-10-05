import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "@clerk/express";

export const requireAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  requireAuth()(req, res, next);
};