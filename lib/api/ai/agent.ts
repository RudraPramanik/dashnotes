import { apiClient } from "@/lib/api/client";

export const AGENT_STREAM_PATH = "/ai/agent/stream";

export type AgentMutationBody = {
  thread_id: string;
  interrupt_id?: string;
};

export type AgentTurnResponse = {
  status?: string;
  type?: string;
  answer?: string;
  thread_id?: string;
  tool?: string;
  args?: Record<string, unknown>;
  interrupt_id?: string;
  steps_taken?: number;
  tool_calls_made?: number;
};

export function resumeAgentTurn(
  body: AgentMutationBody,
): Promise<AgentTurnResponse> {
  return apiClient.post<AgentTurnResponse>("/ai/agent/resume", body);
}

export function rejectAgentTurn(
  body: AgentMutationBody,
): Promise<AgentTurnResponse> {
  return apiClient.post<AgentTurnResponse>("/ai/agent/reject", body);
}
