"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AGENT_STREAM_PATH } from "@/lib/api/ai/agent";
import { apiClient, AiUnavailableError, isApiError } from "@/lib/api/client";
import {
  parseSseJsonData,
  parseSseStream,
  readStringField,
} from "@/lib/api/sse-parser";
import type { ChatMessage } from "@/lib/hooks/ai/use-chat-stream";
import { useStreamGuard } from "@/lib/hooks/use-stream-guard";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export type ToolEvent = {
  name: string;
  params: Record<string, unknown>;
  status: "running" | "complete" | "failed";
  stepIndex: number;
};

export type UseAgentStreamResult = {
  messages: ChatMessage[];
  toolEvents: ToolEvent[];
  stepsTaken: number;
  toolCallsMade: number;
  threadId: string | null;
  isStreaming: boolean;
  error: string | null;
  mutatedNotes: boolean;
  sendMessage: (message: string) => Promise<void>;
  cancel: () => void;
};

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const record: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      record[key] = entry;
    }
    return record;
  }
  return {};
}

export function useAgentStream(
  initialThreadId?: string,
  initialMessages: ChatMessage[] = [],
): UseAgentStreamResult {
  const { guardStream } = useStreamGuard();
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [stepsTaken, setStepsTaken] = useState(0);
  const [toolCallsMade, setToolCallsMade] = useState(0);
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutatedNotes, setMutatedNotes] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const stepRef = useRef(0);

  const cancel = useCallback((): void => {
    abortRef.current?.abort();
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      const safe = await guardStream();
      if (!safe) {
        return;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      stepRef.current = 0;
      setToolEvents([]);
      setMutatedNotes(false);

      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        id: nextId(),
      };
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        id: nextId(),
      };
      setMessages((current) => [...current, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);

      try {
        const res = await apiClient.stream(
          AGENT_STREAM_PATH,
          { message, thread_id: threadId },
          abortRef.current.signal,
        );
        if (!res.body) {
          setError("Something went wrong. Please try again.");
          return;
        }

        for await (const { data } of parseSseStream(res.body)) {
          if (data === "[DONE]") {
            break;
          }
          const payload = parseSseJsonData(data);
          if (payload === "[DONE]") {
            break;
          }
          if (payload === null) {
            continue;
          }
          if (payload.type === "token") {
            const content = readStringField(payload, "content");
            if (content) {
              setMessages((current) => {
                const next = [...current];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    content: last.content + content,
                  };
                }
                return next;
              });
            }
          }
          if (payload.type === "tool_start") {
            const name = readStringField(payload, "tool") ?? "tool";
            stepRef.current += 1;
            const event: ToolEvent = {
              name,
              params: asRecord(payload.args),
              status: "running",
              stepIndex: stepRef.current,
            };
            setToolEvents((current) => [...current, event]);
            setMessages((current) => [
              ...current.slice(0, -1),
              {
                role: "system",
                content:
                  name === "create_note"
                    ? "Creating note…"
                    : name === "update_note"
                      ? "Updating note…"
                      : `Running ${name.replaceAll("_", " ")}…`,
                id: nextId(),
              },
              current[current.length - 1] ?? assistantMessage,
            ]);
          }
          if (payload.type === "tool_end") {
            const name = readStringField(payload, "tool") ?? "tool";
            setToolEvents((current) => {
              const next = [...current];
              const index = [...next]
                .reverse()
                .findIndex(
                  (event) => event.name === name && event.status === "running",
                );
              if (index >= 0) {
                const realIndex = next.length - 1 - index;
                next[realIndex] = { ...next[realIndex], status: "complete" };
              }
              return next;
            });
            if (name === "create_note" || name === "update_note") {
              setMutatedNotes(true);
              if (workspaceId) {
                await queryClient.invalidateQueries({
                  queryKey: queryKeys.notes(workspaceId),
                });
              }
              toast.success(
                name === "create_note"
                  ? "Note created by agent"
                  : "Note updated by agent",
              );
            }
          }
          if (payload.type === "done") {
            const nextThread = readStringField(payload, "thread_id");
            if (nextThread) {
              setThreadId(nextThread);
            }
            const steps = payload.steps_taken;
            if (typeof steps === "number") {
              setStepsTaken(steps);
            }
            const calls = payload.tool_calls_made;
            if (typeof calls === "number") {
              setToolCallsMade(calls);
            }
            if (workspaceId) {
              await queryClient.invalidateQueries({
                queryKey: queryKeys.notes(workspaceId),
              });
              await queryClient.invalidateQueries({
                queryKey: queryKeys.threads(workspaceId),
              });
            }
          }
          if (payload.type === "error") {
            setError(
              `${readStringField(payload, "message") ?? "Agent failed"}. Try Chat for a fast answer.`,
            );
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (err instanceof AiUnavailableError) {
          setError(
            "LLM temporarily unavailable; retry shortly. Try Chat for a fast answer.",
          );
          return;
        }
        if (isApiError(err) && err.status === 429) {
          toast.error(
            `Too many requests. Try again in ${err.retryAfter ?? 60}s`,
          );
          setError(`Too many requests. Try again in ${err.retryAfter ?? 60}s`);
          return;
        }
        setError(
          "Something went wrong. Please try again. Try Chat for a fast answer.",
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [guardStream, queryClient, threadId, workspaceId],
  );

  return {
    messages,
    toolEvents,
    stepsTaken,
    toolCallsMade,
    threadId,
    isStreaming,
    error,
    mutatedNotes,
    sendMessage,
    cancel,
  };
}
