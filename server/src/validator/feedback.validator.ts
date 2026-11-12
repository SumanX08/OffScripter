import { z } from "zod";

export const createFeedbackSchema = z.object({
  type: z.enum([
    "BUG_REPORT",
    "FEATURE_REQUEST",
    "GENERAL",
  ]),
  message: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters.")
    .max(3000, "Feedback cannot exceed 3000 characters."),
  pageUrl: z.string().max(2048).optional(),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum([
    "OPEN",
    "REVIEWING",
    "RESOLVED",
  ]),
  adminResponse: z.string().max(3000).optional(),
});