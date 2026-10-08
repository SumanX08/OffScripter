import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const requireAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { isAuthenticated } = getAuth(req);

  if (!isAuthenticated) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  next();
};