import { QueryClient, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

const runtimeConfig = window.__APP_CONFIG__;

export const API_BASE_URL =
  runtimeConfig?.VITE_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8080";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      successMessage?: string;
      errorMessage?: string;
    };
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.options.meta?.successMessage;
      if (message) toast.success(message);
    },
    onError: (error, _variables, _context, mutation) => {
      const message = mutation.options.meta?.errorMessage;
      toast.error(message ?? error.message ?? "Došlo je do greške");
    },
  }),
});

function getAuthToken(): string {
  return localStorage.getItem("bearer_token") || "";
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  data?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { data, headers, ...rest } = options;
  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? `Request failed with status ${res.status}`;
    const error = new Error(message) as Error & { status?: number; details?: unknown };
    error.status = res.status;
    error.details = body?.details;
    throw error;
  }

  return res.json() as Promise<T>;
}

export async function apiRequest<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const body = await apiFetch<{ data: T | null; error: string | null }>(path, options);
  if (body.error) {
    throw new Error(body.error);
  }
  return body.data!;
}
