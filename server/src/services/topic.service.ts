
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import type { SpinFilters } from "../validator/topic.validator.js";

const FREE_DAILY_LIMIT = 2;
const PRO_DAILY_LIMIT = 10;
const MAX_TRANSACTION_RETRIES = 10;

type TopicSelectionRow = {
  id: string | null;
  slug: string | null;
  title: string | null;
  category: string | null;
  subcategory: string | null;
  difficulty: string | null;
  researchTime: number | null;
  speakingTime: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  usedToday: bigint;
  hasActiveSubscription: boolean;
};

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

function buildTopicCondition(filters: SpinFilters) {
  const categories = filters.categories ?? [];

  if (categories.length === 0) {
    return Prisma.sql`TRUE`;
  }

  const conditions = categories.map(
    ({ id, subcategories }) => {
      if (subcategories.length === 0) {
        return Prisma.sql`
          t."category" = ${id}
        `;
      }

      return Prisma.sql`
        (
          t."category" = ${id}
          AND t."subcategory" IN (
            ${Prisma.join(subcategories)}
          )
        )
      `;
    }
  );

  return Prisma.sql`
    (${Prisma.join(conditions, " OR ")})
  `;
}

export const spinChallenge = async (
  filters: SpinFilters,
  userId: string
) => {
  const serviceStart = performance.now();

  const { start, end } = getUtcDayBounds();

  const topicCondition = buildTopicCondition(filters);

  for (
    let retry = 0;
    retry < MAX_TRANSACTION_RETRIES;
    retry++
  ) {
    try {

      const result = await prisma.$transaction(
        async (tx) => {
          // 1. Check subscription, attempt count,
          //    and select random topic in one query.

          const queryStart = performance.now();

          const rows = await tx.$queryRaw<TopicSelectionRow[]>`
            WITH account_status AS (
              SELECT
                EXISTS (
                  SELECT 1
                  FROM "Subscription" s
                  WHERE s."userId" = ${userId}
                    AND s."status" = 'active'
                    AND s."currentPeriodEnd" > NOW()
                ) AS "hasActiveSubscription",

                (
                  SELECT COUNT(*)
                  FROM "Attempt" a
                  WHERE a."userId" = ${userId}
                    AND a."createdAt" >= ${start}
                    AND a."createdAt" < ${end}
                ) AS "usedToday"
            ),

           selected_topic AS (
  SELECT t.*
  FROM "Topic" t
  WHERE t."isActive" = true
    AND (${topicCondition})
  ORDER BY RANDOM()
  LIMIT 1
)

            SELECT
              t.*,
              a."hasActiveSubscription",
              a."usedToday"
            FROM account_status a
            LEFT JOIN selected_topic t ON TRUE
          `;

          console.log(
            "[PERF] Combined query:",
            (performance.now() - queryStart).toFixed(2),
            "ms"
          );

          const row = rows[0];

          if (!row) {
            throw new Error(
              "Failed to retrieve topic selection"
            );
          }

          const dailyLimit = row.hasActiveSubscription
            ? PRO_DAILY_LIMIT
            : FREE_DAILY_LIMIT;

          if (Number(row.usedToday) >= dailyLimit) {
            throw new Error(
              row.hasActiveSubscription
                ? "PRO_DAILY_LIMIT_REACHED"
                : "FREE_DAILY_LIMIT_REACHED"
            );
          }

          if (!row.id) {
            throw new Error(
              "No topics available for the selected filters"
            );
          }

          // 2. Create attempt inside the transaction.


          const attempt = await tx.attempt.create({
            data: {
              topicId: row.id,
              userId,
            },
          });

          

          const topic = {
            id: row.id,
            slug: row.slug!,
            title: row.title!,
            category: row.category!,
            subcategory: row.subcategory,
            difficulty: row.difficulty!,
            researchTime: row.researchTime!,
            speakingTime: row.speakingTime!,
            createdAt: row.createdAt!,
            updatedAt: row.updatedAt!,
          };

          return {
            attempt,
            topic,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 10000,
          timeout: 15000,
        }
      );

      

     

      return result;
    } catch (error) {
      const isSerializationConflict =
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      console.error(
        "[SPIN SERVICE] Transaction failed:",
        error
      );

      if (
        isSerializationConflict &&
        retry < MAX_TRANSACTION_RETRIES - 1
      ) {
        console.log(
          `[SPIN SERVICE] Retrying transaction (${retry + 1}/${MAX_TRANSACTION_RETRIES})`
        );

        continue;
      }

      

      throw error;
    }
  }

  throw new Error(
    "DAILY_TOPIC_LIMIT_CHECK_FAILED"
  );
};
