"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createNote, deleteNote, updateNote } from "@/lib/api/notes";
import type { Note, NoteCreate, NoteUpdate } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useNoteMutations(): {
  createNote: (data: NoteCreate) => Promise<Note>;
  updateNote: (id: string, data: NoteUpdate) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
} {
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.workspaceId);

  const createMutation = useMutation({
    mutationFn: (data: NoteCreate) => createNote(data),
    onSuccess: async (note: Note) => {
      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.notes(workspaceId),
        });
      }
      sessionStorage.setItem(
        `dashnotes_index_lag_${note.id}`,
        String(Date.now()),
      );
      toast.success("Note created");
      router.push(`/notes/${note.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteUpdate }) =>
      updateNote(id, data),
    onSuccess: async (_note: Note, variables: { id: string; data: NoteUpdate }) => {
      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.note(workspaceId, variables.id),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.notes(workspaceId),
        });
      }
      sessionStorage.setItem(
        `dashnotes_index_lag_${variables.id}`,
        String(Date.now()),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: async (_void: void, id: string) => {
      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.notes(workspaceId),
        });
      }
      toast.success("Note deleted");
      router.push("/notes");
    },
  });

  return {
    createNote: (data: NoteCreate): Promise<Note> =>
      createMutation.mutateAsync(data),
    updateNote: (id: string, data: NoteUpdate): Promise<Note> =>
      updateMutation.mutateAsync({ id, data }),
    deleteNote: (id: string): Promise<void> => deleteMutation.mutateAsync(id),
  };
}
