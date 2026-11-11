
import OpenAI from "openai";

import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { evaluationSchema } from "../validator/evaluation.validator.js";

import { detectFillerWords } from "../utils/speech-analytics.js";
import { calculateSpeakingPace } from "../utils/speech-analytics.js";

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

  // Avoid evaluating the same attempt twice.
  if (attempt.evaluation) {
    return attempt.evaluation;
  }

  // Calculate filler words on the backend.
  const fillerAnalytics = detectFillerWords(
    attempt.transcript
  );

  // Calculate speaking pace using attempt timestamps.
  const speakingAnalytics = calculateSpeakingPace(
    attempt.transcript,
    attempt.speakingStartedAt,
    attempt.speakingEndedAt
  );

  const {
    total: fillerWordsCount,
  } = fillerAnalytics;

  const {
    totalWords,
    speakingDurationSeconds,
    wordsPerMinute,
  } = speakingAnalytics;

  const hasValidDuration =
    speakingDurationSeconds > 0;

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

Also evaluate speaking delivery using the provided backend measurements.

PACE GUIDELINES:
- Below 100 WPM: potentially slow.
- 100–180 WPM: generally balanced.
- Above 180 WPM: potentially fast.

These are guidelines, not strict rules.
Consider the technical complexity and clarity of the explanation.
Do not automatically penalize a speaker for a slightly slower or faster pace.

For paceFeedback:
- Suggest increasing speed if the pace is unnecessarily slow.
- Suggest reducing speed if the pace is too fast.
- Encourage maintaining the current pace if it is appropriate.
- If speaking duration is unavailable, explain that pace could not be assessed.

For fillerWordFeedback:
- Use the backend-provided filler word count.
- If no filler words were detected, acknowledge that.
- If filler words were detected, suggest replacing unnecessary fillers with short pauses.
- Never invent additional filler words or counts.

Also identify:
1. Important concepts that should have been mentioned but were missing.
2. Technically incorrect claims made by the user.

Feedback should be concise, practical, and encouraging.

Do not be overly harsh for minor wording mistakes.

Return ONLY the requested structured output.
        `,
      },
      {
        role: "user",
        content: `
TOPIC:
${attempt.topic.title}

CATEGORY:
${attempt.topic.category}

DIFFICULTY:
${attempt.topic.difficulty}

USER EXPLANATION:
${attempt.transcript}

SPEAKING ANALYTICS:

Total words: ${totalWords}
Speaking duration: ${
          hasValidDuration
            ? `${speakingDurationSeconds} seconds`
            : "Unavailable"
        }
Speaking pace: ${
          hasValidDuration
            ? `${wordsPerMinute} WPM`
            : "Unavailable"
        }

FILLER WORD ANALYSIS:

Total detected filler words: ${fillerWordsCount}
Detected filler word breakdown:
${JSON.stringify(fillerAnalytics.counts)}
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

            paceFeedback: {
              type: "string",
            },

            fillerWordFeedback: {
              type: "string",
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
            "paceFeedback",
            "fillerWordFeedback",
            "missingConcepts",
            "incorrectClaims",
            "feedback",
          ],

          additionalProperties: false,
        },
      },
    },
  });

  if (!response.output_text) {
    throw new Error("AI evaluation returned an empty response");
  }

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

      // Backend-calculated metrics.
      fillerWordsCount,
      wordsPerMinute: hasValidDuration
        ? wordsPerMinute
        : null,
      speakingDurationSeconds: hasValidDuration
        ? speakingDurationSeconds
        : null,

      // AI-generated coaching suggestions.
      paceFeedback: parsed.paceFeedback,
      fillerWordFeedback: parsed.fillerWordFeedback,

      missingConcepts: parsed.missingConcepts,
      incorrectClaims: parsed.incorrectClaims,

      feedback: parsed.feedback,

      model: "gpt-4.1-mini",
      promptVersion: "v2",
    },
  });
};
