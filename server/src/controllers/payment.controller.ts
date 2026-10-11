import type { Request, Response } from "express";
import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import {
  createSubscription,
  getSubscriptionStatus,
  verifyCheckout,
} from "../services/payment.service.js";

export async function subscribe(req: Request, res: Response) {
  try {
    const user = res.locals.user;
    const data = await createSubscription(user.id);

    res.status(201).json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    const status =
      message === "USER_NOT_FOUND" ? 404 :
      message === "SUBSCRIPTION_ALREADY_ACTIVE" ? 409 : 500;

    res.status(status).json({
      success: false,
      error: { code: message, message: "Unable to create subscription" },
    });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const user = res.locals.user;
    const { subscriptionId, paymentId, signature } = req.body ?? {};

    if (
      typeof subscriptionId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string"
    ) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_REQUEST", message: "Missing verification fields" },
      });
      return;
    }

    const data = await verifyCheckout(
      user.id,
      subscriptionId,
      paymentId,
      signature
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    const status =
      message === "SUBSCRIPTION_NOT_FOUND" ? 404 :
      message === "INVALID_PAYMENT_SIGNATURE" ? 400 : 500;

    res.status(status).json({
      success: false,
      error: {
        code: message,
        message: "Payment verification failed",
      },
    });
  }
}

export async function subscriptionStatus(
  _req: Request,
  res: Response
) {
  try {
    const user = res.locals.user;
    const data = await getSubscriptionStatus(user.id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("SUBSCRIPTION STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SUBSCRIPTION_STATUS_FAILED",
        message: "Unable to fetch subscription status",
      },
    });
  }
}

export async function razorpayWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const eventId = req.headers["x-razorpay-event-id"];

  if (
    !webhookSecret ||
    typeof signature !== "string" ||
    !Buffer.isBuffer(req.body)
  ) {
    res.status(400).send("Invalid webhook request");
    return;
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  const suppliedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    res.status(400).send("Invalid webhook signature");
    return;
  }

  let event: any;

  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch {
    res.status(400).send("Invalid JSON");
    return;
  }

  try {
    if (typeof eventId === "string") {
      try {
        await prisma.processedWebhook.create({
          data: {
            eventId,
            eventType: String(event.event ?? "unknown"),
          },
        });
      } catch (error) {
        // A unique event ID means Razorpay is retrying an event
        // that has already been recorded.
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2002"
        ) {
          res.status(200).json({ received: true, duplicate: true });
          return;
        }

        throw error;
      }
    }

    const entity = event.payload?.subscription?.entity;
    const subscriptionId = entity?.id;

    if (typeof subscriptionId === "string") {
      const status = String(entity.status ?? "");
      const periodStart = entity.current_start
        ? new Date(Number(entity.current_start) * 1000)
        : null;
      const periodEnd = entity.current_end
        ? new Date(Number(entity.current_end) * 1000)
        : null;

      const cancellationRequested =
        entity.has_scheduled_changes === true ||
        entity.cancel_at_cycle_end === true;

      await prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: subscriptionId },
        data: {
          status,
          currentPeriodStart:
            periodStart && !Number.isNaN(periodStart.getTime())
              ? periodStart
              : undefined,
          currentPeriodEnd:
            periodEnd && !Number.isNaN(periodEnd.getTime())
              ? periodEnd
              : undefined,
          cancelAtCycleEnd: cancellationRequested,
        },
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}