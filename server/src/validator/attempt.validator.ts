import { z } from "zod";

export const submitAttemptSchema = z.object({
  transcript: z
    .string()
    .trim()
    .min(1, "Transcript cannot be empty")
    .max(20000, "Transcript is too long"),
});