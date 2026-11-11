const FILLER_PHRASES = [
  "you know",
  "i mean",
  "kind of",
  "sort of",
  "um",
  "uh",
  "erm",
  "hmm",
  "basically",
  "actually",
  "literally",
  "like",
];

export const detectFillerWords = (transcript: string) => {
  const normalized = transcript
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = normalized.split(" ").filter(Boolean);

  const counts: Record<string, number> = {};

  for (const phrase of FILLER_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(
      `\\b${escaped}\\b`,
      "g"
    );

    const matches = normalized.match(regex);

    if (matches?.length) {
      counts[phrase] = matches.length;
    }
  }

  const total = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

  return {
    total,
    counts,
    totalWords: words.length,
  };
};

export const calculateSpeakingPace = (
  transcript: string,
  speakingStartedAt: Date | null,
  speakingEndedAt: Date | null
) => {
  if (!speakingStartedAt || !speakingEndedAt) {
    return {
      totalWords: 0,
      speakingDurationSeconds: 0,
      wordsPerMinute: 0,
    };
  }

  const totalWords = transcript
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const durationMs =
    speakingEndedAt.getTime() -
    speakingStartedAt.getTime();

  const speakingDurationSeconds = Math.max(
    0,
    Math.round(durationMs / 1000)
  );

  const wordsPerMinute =
    speakingDurationSeconds > 0
      ? Math.round(
          (totalWords / speakingDurationSeconds) * 60
        )
      : 0;

  return {
    totalWords,
    speakingDurationSeconds,
    wordsPerMinute,
  };
};