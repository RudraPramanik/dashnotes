"use client";

import { useQuery } from "@tanstack/react-query";

import { getThreadMessages } from "@/lib/api/ai/threads";
import type { ThreadMessage } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useThreadMessages(threadId: string | undefined): {
  messages: ThreadMessage[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} {
  const workspaceId = useAuthStore((state) => state.workspaceId);

  const query = useQuery({
    queryKey: queryKeys.threadMessages(workspaceId ?? "none", threadId ?? ""),
    queryFn: () => getThreadMessages(threadId ?? ""),
    enabled: workspaceId !== null && Boolean(threadId),
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
