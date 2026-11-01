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
    typeof eventId !== "string" ||
    !eventId.trim() ||
    !Buffer.isBuffer(req.body)
  ) {
    res.status(400).send("Invalid webhook request");
    return;
  }

  // Verify Razorpay's signature against the original raw request body.
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
    res.status(400).send("Invalid webhook signature");
    return;
  }

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

  const eventType = event?.event;

  if (typeof eventType !== "string") {
    res.status(400).send("Missing event type");
    return;
  }

  const entity = event.payload?.subscription?.entity;
  const subscriptionId = entity?.id;

  try {
    await prisma.$transaction(async (tx) => {
      // Claim this event. The unique eventId prevents duplicate processing.
      await tx.processedWebhook.create({
        data: {
          eventId,
          eventType,
        },
      });

      if (typeof subscriptionId !== "string") {
        // Some events may not contain a subscription entity.
        // The event is recorded so it isn't processed repeatedly.
        return;
      }

      const existing = await tx.subscription.findUnique({
        where: {
          razorpaySubscriptionId: subscriptionId,
        },
        select: { id: true },
      });

      if (!existing) {
        // Throwing rolls back the event record, allowing a retry.
        throw new Error("SUBSCRIPTION_NOT_FOUND");
      }

      const updates: {
        status?: string;
        currentPeriodStart?: Date | null;
        currentPeriodEnd?: Date | null;
        cancelAtCycleEnd?: boolean;
      } = {};

      // Only update status when the provider supplies one.
      if (typeof entity.status === "string") {
        updates.status = entity.status;
      }

      if (
        entity.current_start !== undefined &&
        entity.current_start !== null
      ) {
        const start = new Date(Number(entity.current_start) * 1000);

        if (!Number.isNaN(start.getTime())) {
          updates.currentPeriodStart = start;
        }
      }

      if (
        entity.current_end !== undefined &&
        entity.current_end !== null
      ) {
        const end = new Date(Number(entity.current_end) * 1000);

        if (!Number.isNaN(end.getTime())) {
          updates.currentPeriodEnd = end;
        }
      }

      // Preserve cancellation information when the event omits it.
      if (
        typeof entity.has_scheduled_changes === "boolean" ||
        typeof entity.cancel_at_cycle_end === "boolean"
      ) {
        updates.cancelAtCycleEnd =
          entity.has_scheduled_changes === true ||
          entity.cancel_at_cycle_end === true;
      }

      await tx.subscription.update({
        where: { id: existing.id },
        data: updates,
      });
    });

    res.status(200).json({ received: true });
  } catch (error) {
    // Prisma P2002 means the unique event ID was already processed.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(200).json({
        received: true,
        duplicate: true,
      });
      return;
    }

    console.error("RAZORPAY WEBHOOK ERROR:", error);

    // A 500 lets Razorpay retry transient processing failures.
    res.status(500).json({
      error: "Webhook processing failed",
    });
  }
}
