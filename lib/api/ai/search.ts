import { apiClient } from "@/lib/api/client";

export async function testSearch(
  queryText: string,
  limit = 5,
): Promise<unknown> {
  return apiClient.post<unknown>("/ai/test-search", {
    query_text: queryText,
    limit,
  });
}
