import { apiClient } from "@/lib/api/client";
import type { Notebook, NotebookCreate } from "@/lib/api/types";

export async function getNotebooks(): Promise<Notebook[]> {
  return apiClient.get<Notebook[]>("/notebooks/");
}

export async function createNotebook(data: NotebookCreate): Promise<Notebook> {
  return apiClient.post<Notebook>("/notebooks/", data);
}
