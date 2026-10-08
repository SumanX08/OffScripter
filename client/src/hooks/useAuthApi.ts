import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

import { createAuthenticatedApi } from "../lib/api";

export function useAuthenticatedApi() {
  const { getToken } = useAuth();

  return useMemo(
    () => createAuthenticatedApi(getToken),
    [getToken]
  );
}