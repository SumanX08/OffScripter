
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

async function main() {
  console.log(`Seeding ${topics.length} topics...`);

  // Validate duplicate slugs
  const slugs = topics.map((topic) => topic.slug);

  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Duplicate topic slugs found in seed data.");
  }

  // Validate required fields
  for (const topic of topics) {

    if (
      !topic.slug ||
      !topic.title ||
      !topic.category ||
      !topic.subcategory ||
      !topic.difficulty ||
      typeof topic.researchTime !== "number" ||
      typeof topic.speakingTime !== "number"
    ) {
      throw new Error(
        `Invalid topic data: ${topic.slug || "Unknown topic"} is missing or has invalid fields.`
      );
    }
  }

  // Seed topics
  for (const topic of topics) {
        console.log(topic)

    await prisma.topic.upsert({
      where: { slug: topic.slug },

      update: {
        title: topic.title,
        category: topic.category,
        subcategory: topic.subcategory,
        difficulty: topic.difficulty,
        researchTime: topic.researchTime,
        speakingTime: topic.speakingTime,
      },

      create: topic,
    });
  }

  console.log(`Successfully seeded ${topics.length} topics.`);

  const count = await prisma.topic.count();
  console.log(`Total topics in database: ${count}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
