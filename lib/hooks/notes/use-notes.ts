"use client";

import { useQuery } from "@tanstack/react-query";

import { getNotes } from "@/lib/api/notes";
import type { Note } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

type UseNotesArgs = {
  notebookId?: string;
  tag?: string;
};

export function useNotes({ notebookId, tag }: UseNotesArgs = {}): {
  notes: Note[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  refetch: () => Promise<unknown>;
} {
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const params: Record<string, string> = {};
  if (notebookId) {
    params.notebook_id = notebookId;
  }
  if (tag) {
    params.tag = tag;
  }

  const query = useQuery({
    queryKey: [...queryKeys.notes(workspaceId ?? "none"), notebookId ?? "", tag ?? ""],
    queryFn: () => getNotes(Object.keys(params).length > 0 ? params : undefined),
    enabled: workspaceId !== null,
  });

  const notes = query.data ?? [];

  return {
    notes,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: notes.length === 0,
    refetch: query.refetch,
  };
}
