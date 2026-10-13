
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

export async function requirePro(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = res.locals.user;

    if (!user?.id) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Please sign in to continue.",
        },
      });
      return;
    }

    const now = new Date();

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "active",
        currentPeriodEnd: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      res.status(403).json({
        success: false,
        error: {
          code: "PRO_REQUIRED",
          message: "Upgrade to OffScripter Pro to access this feature.",
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error("PRO ENTITLEMENT CHECK FAILED:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ENTITLEMENT_CHECK_FAILED",
        message: "Unable to verify your subscription.",
      },
    });
  }
}
