type CachedTranscript = {
  attemptId: string;
  userId: string;
  transcript: string;
  speakingEndedAt: Date;
  expiresAt: number;
};

const TTL = 10 * 60 * 1000;

const transcripts = new Map<string, CachedTranscript>();

const getKey = (attemptId: string, userId: string) =>
  `${userId}:${attemptId}`;

export const saveRealtimeTranscript = (
  attemptId: string,
  userId: string,
  transcript: string,
  speakingEndedAt: Date
) => {
  const key = getKey(attemptId, userId);

  transcripts.set(key, {
    attemptId,
    userId,
    transcript,
    speakingEndedAt,
    expiresAt: Date.now() + TTL,
  });

  console.log("[TRANSCRIPT STORE] Saved", {
    attemptId,
    transcriptLength: transcript.length,
  });
};

export const getRealtimeTranscript = (
  attemptId: string,
  userId: string
): CachedTranscript | null => {
  const key = getKey(attemptId, userId);

  const entry = transcripts.get(key);

  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    transcripts.delete(key);
    return null;
  }

  return entry;
};

export const deleteRealtimeTranscript = (
  attemptId: string,
  userId: string
) => {
  transcripts.delete(getKey(attemptId, userId));

  console.log("[TRANSCRIPT STORE] Deleted", {
    attemptId,
  });
};

// Periodically remove expired transcripts.
const cleanupInterval = setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of transcripts) {
    if (entry.expiresAt <= now) {
      transcripts.delete(key);
    }
  }
}, 60_000);

cleanupInterval.unref();