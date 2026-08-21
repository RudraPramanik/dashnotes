"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient, type ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}

export type AiHealthState = {
  status: string | null;
  missing: boolean;
  isError: boolean;
};

export function useAiHealth(): AiHealthState {
  const [missing, setMissing] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.aiHealth(),
    enabled: !missing,
    refetchInterval: 60_000,
    retry: false,
    queryFn: async (): Promise<Record<string, unknown> | null> => {
      try {
        return await apiClient.get<Record<string, unknown>>("/health/ai");
      } catch (error) {
        if (isApiError(error) && error.status === 404) {
          setMissing(true);
          return null;
        }
        throw error;
      }
    },
  });

  const rawStatus = query.data?.status;
  const status = typeof rawStatus === "string" ? rawStatus : null;

  return {
    status,
    missing,
    isError: query.isError,
  };
}
