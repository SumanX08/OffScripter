
import { prisma } from "../config/prisma.js";

type CreateFeedbackInput = {
  userId: string;
  type: "BUG_REPORT" | "FEATURE_REQUEST" | "GENERAL";
  message: string;
  pageUrl?: string|undefined;
};

// Create feedback
export const createFeedback = async (
  input: CreateFeedbackInput
) => {
  return prisma.feedback.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      pageUrl: input.pageUrl ?? null,
    },
    select: {
      id: true,
      type: true,
      message: true,
      status: true,
      pageUrl: true,
      createdAt: true,
    },
  });
};

// Get feedback belonging to a specific user
export const getUserFeedback = async (
  userId: string
) => {
  return prisma.feedback.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      message: true,
      status: true,
      adminResponse: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Get all feedback (admin)
export const getAllFeedback = async () => {
  return prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
  });
};

// Update feedback status and optional admin response
export const updateFeedback = async (
  id: string,
  status: "OPEN" | "REVIEWING" | "RESOLVED",
  adminResponse?: string
) => {
  return prisma.feedback.update({
    where: { id },
    data: {
      status,
      ...(adminResponse !== undefined && {
        adminResponse,
      }),
    },
  });
};
