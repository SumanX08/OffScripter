import { z } from "zod";

export const evaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),

  technicalAccuracy: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  structure: z.number().min(0).max(100),
  depth: z.number().min(0).max(100),
  examples: z.number().min(0).max(100),
  conciseness: z.number().min(0).max(100),

  fillerWordsCount: z.number().int().min(0),

  missingConcepts: z.array(z.string()),
  incorrectClaims: z.array(z.string()),

  feedback: z.string().min(1),
});