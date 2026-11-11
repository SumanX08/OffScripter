import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import webTopics from "../data/web.json" with { type: "json" };
import backendTopics from "../data/backend.json" with { type: "json" };
import frontendTopics from "../data/frontend.json" with { type: "json" };
import databaseTopics from "../data/databases.json" with { type: "json" };
import addtionalTopics from "../data/additional-topics.json" with {type:"json"}
const prisma = new PrismaClient();



const topics = [
  ...webTopics,
  ...backendTopics,
  ...frontendTopics,
  ...databaseTopics,
  ...addtionalTopics
];

async function main() {
  console.log(`Seeding ${topics.length} topics...`);

  const slugs = topics.map((topic) => topic.slug);

  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Duplicate topic slugs found in seed data.");
  }

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        title: topic.title,
        category: topic.category,
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
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });