import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { getAuth } from "@clerk/express";
import { getUserByClerkId } from "../services/user.service.js";

export const attachCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = performance.now();

  try {
    const authStart = performance.now();

    const { userId: clerkId } = getAuth(req);

    console.log(
      "[PERF] Extract Clerk auth:",
      (performance.now() - authStart).toFixed(2),
      "ms"
    );

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

    const dbStart = performance.now();

    const user = await getUserByClerkId(clerkId);

    console.log(
      "[PERF] User lookup:",
      (performance.now() - dbStart).toFixed(2),
      "ms"
    );

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

    console.log(
      "[PERF] Attach current user:",
      (performance.now() - start).toFixed(2),
      "ms"
    );

    next();

  } catch (error) {
    next(error);
  }
};