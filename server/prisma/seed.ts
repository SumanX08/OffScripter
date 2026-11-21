import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

import aiMlTopics from "../data/topics/ai-ml.json" with { type: "json" };
import appDevelopmentTopics from "../data/topics/app-development.json" with { type: "json" };
import cloudTopics from "../data/topics/cloud.json" with { type: "json" };
import computerFundamentalsTopics from "../data/topics/computer-fundamentals.json" with { type: "json" };
import cybersecurityTopics from "../data/topics/cybersecurity.json" with { type: "json" };
import databaseTopics from "../data/topics/databases.json" with { type: "json" };
import devopsTopics from "../data/topics/devops.json" with { type: "json" };
import dsaTopics from "../data/topics/dsa.json" with { type: "json" };
import generativeAiTopics from "../data/topics/generative-ai.json" with { type: "json" };
import languagesTopics from "../data/topics/languages.json" with { type: "json" };
import systemDesignTopics from "../data/topics/system-design.json" with { type: "json" };
import testingTopics from "../data/topics/testing.json" with { type: "json" };
import webDevelopmentTopics from "../data/topics/web-development.json" with { type: "json" };

import taxonomy from "../data/taxonomy.json" with { type: "json" };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const topics = [
  ...aiMlTopics,
  ...appDevelopmentTopics,
  ...cloudTopics,
  ...computerFundamentalsTopics,
  ...cybersecurityTopics,
  ...databaseTopics,
  ...devopsTopics,
  ...dsaTopics,
  ...generativeAiTopics,
  ...languagesTopics,
  ...systemDesignTopics,
  ...testingTopics,
  ...webDevelopmentTopics,
];

const EXPECTED_TOPIC_COUNT = 1610;

function validateTopics() {
  console.log("Validating topic data...");

  if (topics.length !== EXPECTED_TOPIC_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_TOPIC_COUNT} topics, received ${topics.length}.`
    );
  }

  const slugs = new Set<string>();
  const titles = new Set<string>();

  const categoryMap = new Map(
    taxonomy.categories.map((category) => [
      category.id,
      new Set(
        category.subcategories.map(
          (subcategory) => subcategory.id
        )
      ),
    ])
  );

  for (const topic of topics) {
    if (
      !topic.slug?.trim() ||
      !topic.title?.trim() ||
      !topic.category ||
      !topic.subcategory ||
      !topic.difficulty ||
      !Number.isInteger(topic.researchTime) ||
      !Number.isInteger(topic.speakingTime)
    ) {
      throw new Error(
        `Invalid topic: ${topic.slug || "Unknown topic"}`
      );
    }

    // Ensure only the new question bank is imported
    if (!topic.slug.startsWith("v2-")) {
      throw new Error(`Unexpected topic slug: ${topic.slug}`);
    }

    // Validate duplicate slugs
    if (slugs.has(topic.slug)) {
      throw new Error(`Duplicate slug: ${topic.slug}`);
    }

    slugs.add(topic.slug);

    // Validate duplicate titles
    const normalizedTitle = topic.title
      .trim()
      .toLowerCase()
      .replace(/[?!.,]/g, "")
      .replace(/\s+/g, " ");

    if (titles.has(normalizedTitle)) {
      throw new Error(`Duplicate title: ${topic.title}`);
    }

    titles.add(normalizedTitle);

    // Validate category
    const subcategories = categoryMap.get(topic.category);

    if (!subcategories) {
      throw new Error(
        `Invalid category: ${topic.category}`
      );
    }

    // Validate subcategory
    if (!subcategories.has(topic.subcategory)) {
      throw new Error(
        `Invalid subcategory: ${topic.category}/${topic.subcategory}`
      );
    }

    // Validate difficulty
    if (
      !["beginner", "intermediate", "advanced"].includes(
        topic.difficulty.toLowerCase()
      )
    ) {
      throw new Error(
        `Invalid difficulty: ${topic.difficulty}`
      );
    }

    // Validate duration
    if (
      topic.researchTime !== 600 ||
      topic.speakingTime !== 120
    ) {
      throw new Error(
        `Invalid duration: ${topic.slug}`
      );
    }

    // Validate question length
    if (topic.title.trim().split(/\s+/).length > 15) {
      throw new Error(
        `Question too long: ${topic.title}`
      );
    }
  }

  console.log("All topics validated successfully.");
}

async function main() {
  validateTopics();

  const newSlugs = topics.map((topic) => topic.slug);

  const oldTopicFilter = {
    slug: {
      notIn: newSlugs,
    },
  };

  // Preview changes before touching the database
  const [deletable, preservable, existing] =
    await Promise.all([
      prisma.topic.count({
        where: {
          ...oldTopicFilter,
          attempts: { none: {} },
        },
      }),

      prisma.topic.count({
        where: {
          ...oldTopicFilter,
          attempts: { some: {} },
        },
      }),

      prisma.topic.count({
        where: {
          slug: { in: newSlugs },
        },
      }),
    ]);

  console.log({
    topicsToDelete: deletable,
    topicsToPreserve: preservable,
    newTopicsToInsert: topics.length - existing,
  });

  // Require explicit confirmation
  if (!process.argv.includes("--apply")) {
    console.log("Dry run complete. No changes made.");
    console.log(
      "Run with --apply to replace the question bank."
    );
    return;
  }

  const result = await prisma.$transaction(
    async (tx) => {
      // Protect against changing an existing topic's identity
      const existingTopics = await tx.topic.findMany({
        where: {
          slug: { in: newSlugs },
        },
      });

      const incomingTopics = new Map(
        topics.map((topic) => [topic.slug, topic])
      );

      for (const existingTopic of existingTopics) {
        const incoming = incomingTopics.get(
          existingTopic.slug
        )!;

        if (
          existingTopic.title !== incoming.title ||
          existingTopic.category !== incoming.category ||
          existingTopic.subcategory !== incoming.subcategory ||
          existingTopic.difficulty !== incoming.difficulty ||
          existingTopic.researchTime !== incoming.researchTime ||
          existingTopic.speakingTime !== incoming.speakingTime
        ) {
          throw new Error(
            `Existing slug has different content: ${existingTopic.slug}`
          );
        }
      }

      // 1. Delete unused old topics
      const deleted = await tx.topic.deleteMany({
        where: {
          ...oldTopicFilter,
          attempts: {
            none: {},
          },
        },
      });

      // 2. Deactivate old topics with historical attempts
      const deactivated = await tx.topic.updateMany({
        where: {
          ...oldTopicFilter,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // 3. Insert new topics in bulk
      const created = await tx.topic.createMany({
        data: topics.map((topic) => ({
          ...topic,
          isActive: true,
        })),
        skipDuplicates: true,
      });

      // 4. Activate all topics in the new question bank
      await tx.topic.updateMany({
        where: {
          slug: {
            in: newSlugs,
          },
          isActive: false,
        },
        data: {
          isActive: true,
        },
      });

      // 5. Verify final database state
      const activeCount = await tx.topic.count({
        where: {
          isActive: true,
        },
      });

      if (activeCount !== EXPECTED_TOPIC_COUNT) {
        throw new Error(
          `Unexpected active topic count: ${activeCount}`
        );
      }

      return {
        deleted: deleted.count,
        deactivated: deactivated.count,
        created: created.count,
        activeCount,
      };
    },
    {
      isolationLevel: "Serializable",
      maxWait: 10000,
      timeout: 60000,
    }
  );

  console.log("\nQuestion bank migration successful!");
  console.log(`Deleted topics: ${result.deleted}`);
  console.log(`Deactivated topics: ${result.deactivated}`);
  console.log(`Created topics: ${result.created}`);
  console.log(`Active topics: ${result.activeCount}`);

  const totalCount = await prisma.topic.count();

  console.log(`Total database topics: ${totalCount}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });