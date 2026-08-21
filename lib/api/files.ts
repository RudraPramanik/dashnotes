import { apiClient } from "@/lib/api/client";
import type { FileList, FileRecord } from "@/lib/api/types";

export async function getFiles(
  params?: Record<string, string>,
): Promise<FileList> {
  const search = params ? new URLSearchParams(params).toString() : "";
  const path = search.length > 0 ? `/files/?${search}` : "/files/";
  return apiClient.get<FileList>(path);
}

export async function getFile(id: string): Promise<FileRecord> {
  return apiClient.get<FileRecord>(`/files/${id}`);
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete<undefined>(`/files/${id}`);
}

export async function attachFileToNote(
  fileId: string,
  noteId: string,
): Promise<void> {
  await apiClient.post<undefined>(`/files/${fileId}/attach/${noteId}`);
}

export async function downloadFileBlob(id: string): Promise<Blob> {
  return apiClient.getBlob(`/files/${id}/download`);
}
