  import { prisma } from "../config/prisma.js";

 export const getUserByClerkId = async (
  clerkId: string
) => {
  const start = performance.now();

  try {
    return await prisma.user.findUnique({
      where: {
        clerkId,
      },
    });
  } finally {
    console.log(
      "[PERF] getUserByClerkId:",
      (performance.now() - start).toFixed(2),
      "ms"
    );
  }
};

  export const getUserByUsername = async (username: string) => {
    return prisma.user.findUnique({
      where: {
        username,
      },
    });
  };

  export const createUser = async ({
    clerkId,
    email,
    username,
  }: {
    clerkId: string;
    email: string;
    username: string;
  }) => {
    return prisma.user.create({
      data: {
        clerkId,
        email,
        username,
      },
    });
  };