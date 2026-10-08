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

export const finishResearch = async (
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
    throw new Error("Attempt is no longer active");
  }

  if (attempt.stage !== "RESEARCHING") {
    throw new Error("Research phase has already ended");
  }

  return prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      stage: "SPEAKING",
      researchEndedAt: new Date(),
      speakingStartedAt: new Date(),
    },
  });
};

export const submitAttempt = async (
  attemptId: string,
  userId: string,
  transcript: string
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
    throw new Error("Attempt is no longer active");
  }

  if (attempt.stage !== "SPEAKING") {
    throw new Error("Attempt is not in the speaking phase");
  }

  return prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      stage: "SUBMITTED",
      status: "COMPLETED",
      transcript,
      speakingEndedAt: new Date(),
      submittedAt: new Date(),
      endedAt: new Date(),
    },
  });
};

export const getAttempt = async (
  attemptId: string,
  userId: string
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId,
    },
    include: {
      topic: true,
      evaluation: true,
    },
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  return attempt;
};

export const submitAudioAttempt = async (
  attemptId: string,
  userId: string,
  transcript: string
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

  if (attempt.stage !== "SPEAKING") {
    throw new Error(
      "Attempt is not in the speaking phase"
    );
  }

  return prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      transcript,
      stage: "SUBMITTED",
      status: "COMPLETED",
      speakingEndedAt: new Date(),
      submittedAt: new Date(),
      endedAt: new Date(),
    },
  });
};

export const getAttemptHistory = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);

  const skip = (safePage - 1) * safeLimit;

  const [attempts, total] = await Promise.all([
    prisma.attempt.findMany({
      where: {
        userId,
        status: "COMPLETED",
        stage: "SUBMITTED",
      },

      include: {
        topic: true,
        evaluation: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: safeLimit,
    }),

    prisma.attempt.count({
      where: {
        userId,
        status: "COMPLETED",
        stage: "SUBMITTED",
      },
    }),
  ]);

  return {
    attempts,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      hasNextPage: skip + attempts.length < total,
      hasPreviousPage: safePage > 1,
    },
  };
};

