import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { getAuth } from "@clerk/express";

export const requireAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = performance.now();

  const { isAuthenticated } = getAuth(req);

  console.log(
    "[PERF] Require authentication:",
    (performance.now() - start).toFixed(2),
    "ms"
  );

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