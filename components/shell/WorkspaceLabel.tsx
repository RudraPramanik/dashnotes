"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentWorkspace } from "@/lib/api/workspaces";
import { queryKeys } from "@/lib/query-keys";

export function WorkspaceLabel() {
  const query = useQuery({
    queryKey: queryKeys.workspaceMe(),
    queryFn: getCurrentWorkspace,
  });

  if (query.isLoading) {
    return (
      <p className="truncate px-3 text-sm text-muted-foreground">Workspace</p>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p className="truncate px-3 text-sm text-muted-foreground">
        Workspace unavailable
      </p>
    );
  }

  return (
    <p className="truncate px-3 text-sm font-medium" title={query.data.name}>
      {query.data.name}
    </p>
  );
}
