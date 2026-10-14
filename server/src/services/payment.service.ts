import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import {
  razorpay,
  razorpayKeyId,
} from "../config/razorpay.js";
import  {env} from '../config/env.js'

const planId = env.RAZORPAY_PRO_PLAN_ID;
const keySecret = env.RAZORPAY_KEY_SECRET;

if (!planId || !keySecret) {
  throw new Error("Razorpay plan ID or secret is missing");
}

export async function createSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const existing = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["created", "authenticated", "active", "pending"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    if (["active", "authenticated"].includes(existing.status)) {
      throw new Error("SUBSCRIPTION_ALREADY_ACTIVE");
    }

    if (["created", "pending"].includes(existing.status)) {
      return {
        subscriptionId: existing.razorpaySubscriptionId,
        keyId: razorpayKeyId,
      };
    }
  }

  const razorpaySubscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 120,
    quantity: 1,
    customer_notify: 1,
    notes: {
      userId,
      email: user.email,
      product: "OffScripter Pro",
    },
  });

  await prisma.subscription.create({
    data: {
      userId,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayPlanId: planId,
      status: razorpaySubscription.status,
    },
  });

  return {
    subscriptionId: razorpaySubscription.id,
    keyId: razorpayKeyId,
  };
}


export async function verifyCheckout(
  userId: string,
  subscriptionId: string,
  paymentId: string,
  signature: string
) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      razorpaySubscriptionId: subscriptionId,
    },
  });

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");

  if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
    throw new Error("INVALID_PAYMENT_SIGNATURE");
  }

  const suppliedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    throw new Error("INVALID_PAYMENT_SIGNATURE");
  }

  const providerSubscription = await razorpay.subscriptions.fetch(
    subscriptionId
  );

  console.log("RAZORPAY SUBSCRIPTION:", {
  id: providerSubscription.id,
  status: providerSubscription.status,
  current_start: providerSubscription.current_start,
  current_end: providerSubscription.current_end,
  plan_id: providerSubscription.plan_id,
});

  if (providerSubscription.plan_id !== subscription.razorpayPlanId) {
    throw new Error("SUBSCRIPTION_PLAN_MISMATCH");
  }

  const currentPeriodStart =
    providerSubscription.current_start
      ? new Date(Number(providerSubscription.current_start) * 1000)
      : null;

  const currentPeriodEnd =
    providerSubscription.current_end
      ? new Date(Number(providerSubscription.current_end) * 1000)
      : null;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: providerSubscription.status,
      currentPeriodStart:
        currentPeriodStart &&
        !Number.isNaN(currentPeriodStart.getTime())
          ? currentPeriodStart
          : undefined,
      currentPeriodEnd:
        currentPeriodEnd &&
        !Number.isNaN(currentPeriodEnd.getTime())
          ? currentPeriodEnd
          : undefined,
    },
  });

  return {
    verified: true,
    status: providerSubscription.status,
  };
}



export async function getSubscriptionStatus(userId: string) {
  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
   where: {
  userId,
  status: "active",
  currentPeriodEnd: {
    gt: now,
  },
},
    orderBy: { createdAt: "desc" },
  });

  if (subscription) {
    return {
      isPro: true,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtCycleEnd: subscription.cancelAtCycleEnd,
    };
  }

  const latestSubscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return {
    isPro: false,
    status: latestSubscription?.status ?? null,
    currentPeriodStart: latestSubscription?.currentPeriodStart ?? null,
    currentPeriodEnd: latestSubscription?.currentPeriodEnd ?? null,
    cancelAtCycleEnd: latestSubscription?.cancelAtCycleEnd ?? false,
  };
}
