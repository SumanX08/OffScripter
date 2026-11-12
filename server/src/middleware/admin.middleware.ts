import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { getAuth } from "@clerk/express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = getAuth(req);

  const adminIds = (
    process.env.FEEDBACK_ADMIN_CLERK_IDS ?? ""
  )
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!userId || !adminIds.includes(userId)) {
    res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access required.",
      },
    });
    return;
  }

  next();
};