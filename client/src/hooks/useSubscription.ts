
import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedApi } from "./useAuthApi";

export interface SubscriptionStatus {
  isPro: boolean;
  status: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtCycleEnd: boolean;
}

interface ApiResponse {
  success: boolean;
  data: SubscriptionStatus;
}

export function useSubscription() {
  const api = useAuthenticatedApi();

  const [subscription, setSubscription] =
    useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse>("/payments/status");
      setSubscription(response.data.data);
    } catch {
      setError("Unable to load your subscription status.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    subscription,
    loading,
    error,
    refresh,
  };
}
