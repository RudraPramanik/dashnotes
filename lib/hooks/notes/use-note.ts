"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getNote } from "@/lib/api/notes";
import type { Note } from "@/lib/api/types";
import { useIndexingPoll } from "@/lib/hooks/use-indexing-poll";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getOptionalIndexingStatus } from "@/lib/utils/indexing-status";

export function useNote(id: string): {
  note: Note | undefined;
  isLoading: boolean;
  isError: boolean;
  pollingExceeded: boolean;
  refetch: () => Promise<unknown>;
} {
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const queryClient = useQueryClient();
  const queryKey = queryKeys.note(workspaceId ?? "none", id);
  const { refetchInterval, pollingExceeded } = useIndexingPoll(
    getOptionalIndexingStatus(queryClient.getQueryData<Note>(queryKey)),
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getNote(id),
    enabled: workspaceId !== null && id.length > 0,
    refetchInterval,
  });

  return {
    note: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    pollingExceeded,
    refetch: query.refetch,
  };
}
