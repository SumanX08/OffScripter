import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { getUserByClerkId } from "../services/user.service.js";

export const attachCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const user = await getUserByClerkId(clerkId);

  if (!user) {
    res.status(404).json({
      success: false,
      error: {
        code: "USER_NOT_FOUND",
        message: "OffScripter user profile not found",
      },
    });
    return;
  }

  res.locals.user = user;

  next();
};