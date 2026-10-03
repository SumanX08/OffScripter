import { prisma } from "../config/prisma.js";
import type { z } from "zod";
import { spinTopicSchema } from "../validator/topic.validator.js";

type SpinFilters = z.infer<typeof spinTopicSchema>;

export const spinChallenge = async (filters: SpinFilters) => {
  console.log("FILTERS RECEIVED:", filters);

  const where = {
    ...(filters.category !== undefined && {
      category: filters.category,
    }),

    ...(filters.difficulty !== undefined && {
      difficulty: filters.difficulty,
    }),
  };

  console.log("PRISMA WHERE:", where);

  const allTopics = await prisma.topic.findMany({
    select: {
      title: true,
      category: true,
      difficulty: true,
    },
  });

  console.log("DATABASE TOPICS:", allTopics);

  const topicCount = await prisma.topic.count({
    where,
  });

  console.log("MATCHING COUNT:", topicCount);

  if (topicCount === 0) {
    throw new Error("No topics available for the selected filters");
  }

  const randomIndex = Math.floor(Math.random() * topicCount);

  const topic = await prisma.topic.findFirst({
    where,
    skip: randomIndex,
  });

  if (!topic) {
    throw new Error("Failed to select a topic");
  }

  return topic;
};