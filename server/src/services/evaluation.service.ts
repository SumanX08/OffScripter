import OpenAI from "openai";

import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { evaluationSchema } from "../validator/evaluation.validator.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const evaluateAttempt = async (
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
    throw new Error("Attempt not found");
  }

  if (attempt.stage !== "SUBMITTED") {
    throw new Error("Attempt has not been submitted");
  }

  if (!attempt.transcript) {
    throw new Error("Attempt has no transcript");
  }

  // Don't evaluate the same attempt twice.
  if (attempt.evaluation) {
    return attempt.evaluation;
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",

    input: [
      {
        role: "system",
        content: `
You are the technical communication evaluator for OffScripter.

The user was given a technical topic and had to explain it verbally.

Evaluate the explanation fairly based ONLY on what the user actually said.

Do not reward the user for concepts they did not explain.

Score each category from 0 to 100:

- overallScore
- technicalAccuracy
- clarity
- structure
- depth
- examples
- conciseness

Also count obvious filler words such as:
"um", "uh", "like", "you know", "basically", "actually", etc.

Identify:
1. Important concepts that should have been mentioned but were missing.
2. Technically incorrect claims made by the user.

Feedback should be concise and practical.

Focus on helping the user improve their technical speaking ability.

Do not be overly harsh for minor wording mistakes.

Return ONLY the requested structured output.
        `,
      },
      {
        role: "user",
        content: `
Topic:
${attempt.topic.title}

Category:
${attempt.topic.category}

Difficulty:
${attempt.topic.difficulty}

User explanation:
${attempt.transcript}
        `,
      },
    ],

    text: {
      format: {
        type: "json_schema",
        name: "technical_evaluation",
        strict: true,
        schema: {
          type: "object",

          properties: {
            overallScore: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },

            technicalAccuracy: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },

            clarity: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },

            structure: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },

            depth: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },

            examples: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },

            conciseness: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },

            fillerWordsCount: {
              type: "integer",
              minimum: 0,
            },

            missingConcepts: {
              type: "array",
              items: {
                type: "string",
              },
            },

            incorrectClaims: {
              type: "array",
              items: {
                type: "string",
              },
            },

            feedback: {
              type: "string",
            },
          },

          required: [
            "overallScore",
            "technicalAccuracy",
            "clarity",
            "structure",
            "depth",
            "examples",
            "conciseness",
            "fillerWordsCount",
            "missingConcepts",
            "incorrectClaims",
            "feedback",
          ],

          additionalProperties: false,
        },
      },
    },
  });

  const parsed = evaluationSchema.parse(
    JSON.parse(response.output_text)
  );

  return prisma.evaluation.create({
    data: {
      attemptId: attempt.id,

      overallScore: parsed.overallScore,
      technicalAccuracy: parsed.technicalAccuracy,
      clarity: parsed.clarity,
      structure: parsed.structure,
      depth: parsed.depth,
      examples: parsed.examples,
      conciseness: parsed.conciseness,

      fillerWordsCount: parsed.fillerWordsCount,

      missingConcepts: parsed.missingConcepts,
      incorrectClaims: parsed.incorrectClaims,

      feedback: parsed.feedback,

      model: "gpt-4.1-mini",
      promptVersion: "v1",
    },
  });
};