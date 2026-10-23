
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type { z } from "zod";
import { spinTopicSchema } from "../validator/topic.validator.js";

type SpinFilters = z.infer<typeof spinTopicSchema>;

const FREE_DAILY_LIMIT = 1;
const PRO_DAILY_LIMIT = 3;
const MAX_TRANSACTION_RETRIES = 3;

function getUtcDayBounds() {
  const now = new Date();

  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export const spinChallenge = async (
  filters: SpinFilters,
  userId: string
) => {
  for (let retry = 0; retry < MAX_TRANSACTION_RETRIES; retry++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const now = new Date();

          const activeSubscription = await tx.subscription.findFirst({
  where: {
    userId,
    status: "active",
    currentPeriodEnd: {
      gt: now,
    },
  },
  select: {
    id: true,
  },
});

          const dailyLimit = activeSubscription
            ? PRO_DAILY_LIMIT
            : FREE_DAILY_LIMIT;

          const { start, end } = getUtcDayBounds();

          // Count every attempt created today, including abandoned
          // or unfinished attempts, so users cannot bypass the quota.
          const usedToday = await tx.attempt.count({
            where: {
              userId,
              createdAt: {
                gte: start,
                lt: end,
              },
            },
          });

          if (usedToday >= dailyLimit) {
            throw new Error("DAILY_TOPIC_LIMIT_REACHED");
          }

          const where = {
            ...(filters.category !== undefined && {
              category: filters.category,
            }),
            ...(filters.difficulty !== undefined && {
              difficulty: filters.difficulty,
            }),
          };

          const topicCount = await tx.topic.count({ where });

          if (topicCount === 0) {
            throw new Error(
              "No topics available for the selected filters"
            );
          }

          const randomIndex = Math.floor(
            Math.random() * topicCount
          );

          const topic = await tx.topic.findFirst({
            where,
            skip: randomIndex,
          });

          if (!topic) {
            throw new Error("Failed to select a topic");
          }

          const attempt = await tx.attempt.create({
            data: {
              topicId: topic.id,
              userId,
            },
          });

          return { attempt, topic };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 10000,
  timeout: 15000,
        }
      );
    } catch (error) {
      const isSerializationConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      if (isSerializationConflict && retry < MAX_TRANSACTION_RETRIES - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("DAILY_TOPIC_LIMIT_CHECK_FAILED");
};
