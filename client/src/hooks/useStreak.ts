
import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedApi } from "./useAuthApi";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  practicedToday: boolean;
  lastPracticeDate: string | null;
  practiceDates: string[];
  timeZone: string;
}

interface StreakResponse {
  success: boolean;
  data: StreakData;
}

export function useStreak() {
  const api = useAuthenticatedApi();

  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await api.get<StreakResponse>("/attempts/streak");

      setStreak(response.data.data);
    } catch {
      setError("Couldn't load your practice streak.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { streak, loading, error, refresh };
}
