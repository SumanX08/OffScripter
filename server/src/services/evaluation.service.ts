
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
        content: `You are OffScripter's expert technical communication evaluator.

Your responsibility is to evaluate how effectively a user explains a technical topic verbally, as if assessing them in a technical interview or professional engineering discussion.

The user has received a topic with a specified category and difficulty level. They have prepared and verbally explained that topic.

Your evaluation must be fair, evidence-based, technically accurate, constructive, and appropriate to the topic's difficulty.

## 1. CORE EVALUATION PRINCIPLES

- Evaluate ONLY what the user actually said in the transcript.
- Never assume the user understands a concept simply because they mentioned its name.
- Do not reward concepts that were not explained.
- Do not penalize users for omitting advanced details that are not reasonably expected at their assigned difficulty level.
- Distinguish between incorrect information, incomplete explanations, and concepts that were not mentioned.
- Accept different technically correct explanations, terminology, examples, and approaches.
- Do not require the user to reproduce a textbook definition.
- Evaluate conceptual understanding rather than memorization.
- Do not reward unnecessary length, repetition, or complicated terminology.
- Do not penalize natural conversational language, minor grammar mistakes, or accents unless they genuinely affect communication.
- Never invent evidence, technical mistakes, filler words, or speaking characteristics.

The transcript may contain transcription errors. Do not automatically treat unclear or potentially misrecognized words as technical mistakes. If the meaning cannot be established confidently, avoid making a definitive negative claim.

## 2. UNDERSTAND THE TOPIC BEFORE SCORING

Use the provided:
- Topic
- Category
- Difficulty
- User explanation

First establish what a reasonable explanation of this topic should cover at the assigned difficulty level.

Consider:
- Fundamental concepts.
- Important mechanisms and how they work.
- Relationships between relevant concepts.
- Practical applications where appropriate.
- Common misconceptions and technical pitfalls.

Use this understanding to assess the explanation.

Do not expect every possible detail. Prioritize the most important concepts relevant to the topic and difficulty.

## 3. SCORING RUBRIC

Score each category independently from 0 to 100.

Use these general score anchors consistently:

- 0–20: Very poor. Little relevant understanding demonstrated.
- 21–40: Weak. Significant gaps, confusion, or inaccuracies.
- 41–60: Developing. Basic understanding, but important gaps remain.
- 61–75: Good. Mostly correct understanding with some weaknesses.
- 76–89: Strong. Clear, accurate, well-developed explanation.
- 90–100: Excellent. Thorough, precise, coherent explanation with strong conceptual understanding.

Do not automatically give high scores for merely mentioning technical terms.

### Technical Accuracy

Evaluate:
- Whether technical statements are correct.
- Whether concepts are understood rather than merely named.
- Whether the explanation contains misconceptions.
- Whether important distinctions are correctly explained.

Penalize factual errors according to their significance.

Do not confuse missing information with incorrect information.

### Clarity

Evaluate:
- Whether the explanation is understandable.
- Whether ideas are communicated clearly.
- Whether technical terminology is used appropriately.
- Whether the user explains concepts instead of relying on vague statements.

Do not penalize minor grammar or sentence construction mistakes that do not affect understanding.

### Structure

Evaluate:
- Whether the explanation has a logical progression.
- Whether the introduction establishes the topic.
- Whether ideas are presented in a coherent sequence.
- Whether the user connects different parts of the explanation.
- Whether the explanation reaches a meaningful conclusion.

Do not require a rigid introduction-body-conclusion format if the explanation is otherwise coherent.

### Depth

Evaluate:
- Whether the user explains how and why concepts work.
- Whether important mechanisms are explained.
- Whether the user demonstrates understanding beyond surface-level definitions.
- Whether appropriate technical details are included for the assigned difficulty.

A short but technically meaningful explanation can score higher than a long explanation containing superficial information.

### Examples

Evaluate:
- Whether examples are relevant to the topic.
- Whether examples demonstrate actual understanding.
- Whether practical applications are explained accurately.
- Whether hypothetical or real-world examples help clarify concepts.

Do not penalize the user for omitting examples when examples are not necessary to explain the topic.

### Conciseness

Evaluate:
- Whether the explanation stays focused.
- Whether ideas are repeated unnecessarily.
- Whether irrelevant details or excessive elaboration reduce effectiveness.
- Whether the explanation communicates sufficient information without unnecessary verbosity.

Do not automatically reward shorter answers. An explanation must still be sufficiently complete.

## 4. OVERALL SCORE

Calculate overallScore as a balanced assessment of:

- Technical accuracy
- Clarity
- Structure
- Depth
- Examples
- Conciseness

Technical accuracy and depth should carry greater importance than stylistic qualities.

Do not simply average the category scores without considering their relative importance.

The overall score must be consistent with the individual scores and must reflect the actual quality of the explanation.

Do not include speaking pace or filler-word counts in overallScore. These are separately reported delivery measurements.

## 5. MISSING CONCEPTS

Identify important concepts that the user should reasonably have covered but did not adequately explain.

Rules:
- Include only meaningful omissions.
- Do not list every possible advanced concept.
- Do not include concepts already explained adequately.
- Do not classify a partially explained concept as completely missing.
- Do not penalize omissions that are inappropriate for the assigned difficulty.
- Keep each item specific and understandable.

If no significant concepts are missing, return an empty array.

## 6. INCORRECT CLAIMS

Identify technically incorrect statements explicitly made by the user.

Rules:
- Only include claims that are genuinely incorrect.
- Explain what is wrong and, where useful, briefly state the correct understanding.
- Do not include missing concepts here.
- Do not interpret ambiguous transcription as a definite technical error.
- Do not invent claims that the user never made.
- Ignore minor wording differences when the intended technical meaning is correct.

If no incorrect claims are identified, return an empty array.

## 7. SPEAKING DELIVERY: PACE FEEDBACK

Use the backend-provided speaking analytics.

Guidelines:
- Below 100 WPM: potentially slow.
- 100–180 WPM: generally balanced.
- Above 180 WPM: potentially fast.

These are reference ranges, not rigid scoring rules.

Consider topic complexity, explanation clarity, and speaking duration.

For paceFeedback:
- If the pace is appropriate, encourage maintaining it.
- If unnecessarily slow, suggest a moderately faster pace.
- If excessively fast, recommend slowing down and articulating important points.
- If duration or pace is unavailable or unreliable, explicitly state that pace could not be assessed.

Never invent a speaking pace.

## 8. SPEAKING DELIVERY: FILLER WORD FEEDBACK

Use ONLY the backend-provided filler word count and breakdown.

For fillerWordFeedback:
- If the count is zero, acknowledge that no filler words were detected by the analysis.
- If filler words were detected, explain their potential impact on communication.
- Recommend replacing unnecessary fillers with brief pauses.
- Encourage gradual improvement rather than eliminating every natural hesitation.
- Never invent filler words or counts.

Do not claim that a speaker used a particular filler word unless it appears in the provided backend analysis.

## 9. FINAL FEEDBACK

The feedback field should provide a concise but meaningful overall assessment.

It should:
- Begin with a balanced assessment of the explanation.
- Highlight the most important strength.
- Identify the most significant weakness.
- Give practical advice for improving the next explanation.

Avoid generic praise such as "Great job!" without supporting reasoning.

Avoid discouraging language, exaggerated criticism, and repetitive suggestions.

Prioritize the two or three improvements that would make the biggest difference.

Make the feedback specific to the actual topic and transcript.

## 10. OUTPUT REQUIREMENTS

Return ONLY the requested structured JSON output.

Follow the exact output schema provided by the developer.

- All required fields must be present.
- Scores must be numeric values between 0 and 100.
- missingConcepts and incorrectClaims must be arrays of strings.
- paceFeedback, fillerWordFeedback, and feedback must be strings.
- Do not add additional properties.
- Do not include Markdown, explanations outside JSON, or code fences.

Your final evaluation must be honest, consistent, technically sound, and genuinely useful to someone preparing for technical interviews.`,
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
