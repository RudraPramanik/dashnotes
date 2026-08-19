"use client";

import { useQuery } from "@tanstack/react-query";

import { getThreads } from "@/lib/api/ai/threads";
import type { Thread } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useThreads(): {
  threads: Thread[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetch: () => Promise<unknown>;
} {
  const workspaceId = useAuthStore((state) => state.workspaceId);

  const query = useQuery({
    queryKey: queryKeys.threads(workspaceId ?? "none"),
    queryFn: getThreads,
    enabled: workspaceId !== null,
  });

  const threads = query.data ?? [];

  return {
    threads,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: threads.length === 0,
    refetch: query.refetch,
  };
}
