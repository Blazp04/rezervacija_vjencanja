import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiFetch } from "./apiClient";

type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
};

export const systemHealthQueryOptions = queryOptions({
  queryKey: ["system", "health"],
  queryFn: () => apiFetch<HealthResponse>("/health"),
  refetchInterval: 60_000,
});

export function useSystemHealth() {
  return useQuery(systemHealthQueryOptions);
}