import { prisma } from "../config/prisma.js";

export const completeAttempt = async (
  attemptId: string,
  userId: string
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId,
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
      id: attempt.id,
    },
    data: {
      status: "COMPLETED",
      endedAt: new Date(),
    },
  });
};