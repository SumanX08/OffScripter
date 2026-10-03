import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import webTopics from "../data/web.json" with { type: "json" };
import backendTopics from "../data/backend.json" with { type: "json" };
import frontendTopics from "../data/frontend.json" with { type: "json" };
import databaseTopics from "../data/databases.json" with { type: "json" };

const prisma = new PrismaClient();



const topics = [
  ...webTopics,
  ...backendTopics,
  ...frontendTopics,
  ...databaseTopics,
];

async function main() {
  console.log({
    web: webTopics.length,
    backend: backendTopics.length,
    frontend: frontendTopics.length,
    databases: databaseTopics.length,
  });

  

  

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: {
        slug: topic.slug,
      },
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

 

}
main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });