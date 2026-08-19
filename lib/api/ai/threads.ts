import { apiClient } from "@/lib/api/client";
import type { Thread, ThreadMessage } from "@/lib/api/types";

export async function getThreads(): Promise<Thread[]> {
  return apiClient.get<Thread[]>("/ai/threads");
}

export async function getThreadMessages(
  threadId: string,
): Promise<ThreadMessage[]> {
  return apiClient.get<ThreadMessage[]>(`/ai/threads/${threadId}/messages`);
}

export async function deleteThread(threadId: string): Promise<void> {
  await apiClient.delete<undefined>(`/ai/threads/${threadId}`);
}
