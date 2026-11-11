import axios from "axios";
import { useProfileStore } from "@/store/useProfileStore";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// felt has no refresh: the token is permanent and a 401 means "invalid account".
apiClient.interceptors.request.use((config) => {
  const token = useProfileStore.getState().token;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
