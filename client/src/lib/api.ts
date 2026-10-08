import axios from "axios";
import type { GetToken } from "@clerk/types";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
});

export const createAuthenticatedApi = (
  getToken: GetToken
) => {
  const authenticatedApi = axios.create({
    baseURL,
  });

  authenticatedApi.interceptors.request.use(
    async (config) => {
      const token = await getToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      return config;
    }
  );

  return authenticatedApi;
};