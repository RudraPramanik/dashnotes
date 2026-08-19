"use client";

import { useQuery } from "@tanstack/react-query";

import { getMembers } from "@/lib/api/workspaces";
import type { WorkspaceMember } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useMembers(): {
  members: WorkspaceMember[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} {
  const workspaceId = useAuthStore((state) => state.workspaceId);

  const query = useQuery({
    queryKey: queryKeys.members(workspaceId ?? "none"),
    queryFn: getMembers,
    enabled: workspaceId !== null,
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
