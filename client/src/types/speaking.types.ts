export type AttemptResponse = {
  id: string;

  status:
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ABANDONED";

  stage:
    | "RESEARCHING"
    | "SPEAKING"
    | "SUBMITTED";

  speakingStartedAt: string | null;

  topic: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    researchTime: number;
    speakingTime: number;
  };
};
