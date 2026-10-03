export type TopicDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export interface TopicSeed {
  title: string;
  category: string;
  difficulty: TopicDifficulty;
  researchTime: number;
  speakingTime: number;
}