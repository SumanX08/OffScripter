import { prisma } from "../config/prisma.js";

export const getUserByClerkId = async (clerkId: string) => {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
  });
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