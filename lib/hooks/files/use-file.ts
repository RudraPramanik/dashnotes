"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getFile } from "@/lib/api/files";
import type { FileRecord } from "@/lib/api/types";
import { useIndexingPoll } from "@/lib/hooks/use-indexing-poll";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getOptionalIndexingStatus } from "@/lib/utils/indexing-status";

export function useFile(id: string): {
  file: FileRecord | undefined;
  isLoading: boolean;
  isError: boolean;
  pollingExceeded: boolean;
  refetch: () => Promise<unknown>;
} {
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const queryClient = useQueryClient();
  const queryKey = queryKeys.file(workspaceId ?? "none", id);
  const { refetchInterval, pollingExceeded } = useIndexingPoll(
    getOptionalIndexingStatus(queryClient.getQueryData<FileRecord>(queryKey)),
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getFile(id),
    enabled: workspaceId !== null && id.length > 0,
    refetchInterval,
  });

  return {
    file: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    pollingExceeded,
    refetch: query.refetch,
  };
}
