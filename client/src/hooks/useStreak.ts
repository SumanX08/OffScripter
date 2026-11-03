
import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "./useAuthApi";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  practicedToday: boolean;
  lastPracticeDate: string | null;
  practiceDates: string[];
  totalPracticeDays: number;
  timeZone: string;
  historyDays: number;
  totalCompletedAttempts: number;
  dailyActivity: Record<string, number>;
}

interface StreakResponse {
  success: boolean;
  data: StreakData;
}

export function useStreak() {
  const api = useAuthenticatedApi();

  const query = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const response = await api.get<StreakResponse>(
        "/attempts/streak"
      );

      return response.data.data;
    },
  });

  return {
    streak: query.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? "Unable to load practice streak."
      : null,
    refresh: query.refetch,
  };
}
