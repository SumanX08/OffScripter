import { prisma } from "../config/prisma.js";

export const completeAttempt = async (attemptId: string) => {
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt is already completed or abandoned");
  }

  return prisma.attempt.update({
    where: {
      id: attemptId,
    },
    data: {
      status: "COMPLETED",
      endedAt: new Date(),
    },
  });
};