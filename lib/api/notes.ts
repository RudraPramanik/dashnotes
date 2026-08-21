import { apiClient } from "@/lib/api/client";
import type { Note, NoteCreate, NoteUpdate } from "@/lib/api/types";

export async function getNotes(
  params?: Record<string, string>,
): Promise<Note[]> {
  const search = params ? new URLSearchParams(params).toString() : "";
  const path = search.length > 0 ? `/notes/?${search}` : "/notes/";
  return apiClient.get<Note[]>(path);
}

export async function getNote(id: string): Promise<Note> {
  return apiClient.get<Note>(`/notes/${id}`);
}

export async function createNote(data: NoteCreate): Promise<Note> {
  return apiClient.post<Note>("/notes/", data);
}

export async function updateNote(
  id: string,
  data: NoteUpdate,
): Promise<Note> {
  return apiClient.patch<Note>(`/notes/${id}`, data);
}

export async function deleteNote(id: string): Promise<void> {
  await apiClient.delete<undefined>(`/notes/${id}`);
}
