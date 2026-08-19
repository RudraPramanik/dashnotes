"use client";

import { useQuery } from "@tanstack/react-query";

import { getFiles } from "@/lib/api/files";
import type { FileRecord } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useFiles(): {
  files: FileRecord[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetch: () => Promise<unknown>;
} {
  const workspaceId = useAuthStore((state) => state.workspaceId);

  const query = useQuery({
    queryKey: queryKeys.files(workspaceId ?? "none"),
    queryFn: () => getFiles(),
    enabled: workspaceId !== null,
  });

  const files = query.data?.items ?? [];

  return {
    files,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: files.length === 0,
    refetch: query.refetch,
  };
}
