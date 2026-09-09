"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AGENT_STREAM_PATH,
  rejectAgentTurn,
  resumeAgentTurn,
} from "@/lib/api/ai/agent";
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

const LLM_UNAVAILABLE_COPY =
  "LLM temporarily unavailable; retry shortly. Try Chat for a fast answer.";

const PENDING_STORAGE_PREFIX = "dashnotes:agent-pending:";

function pendingStorageKey(threadId: string): string {
  return `${PENDING_STORAGE_PREFIX}${threadId}`;
}

function readStoredPending(
  threadId: string | null | undefined,
): PendingApproval | null {
  if (!threadId || typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(pendingStorageKey(threadId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PendingApproval;
    if (
      typeof parsed?.threadId !== "string" ||
      typeof parsed.tool !== "string"
    ) {
      return null;
    }
    return {
      tool: parsed.tool,
      args: asRecord(parsed.args),
      threadId: parsed.threadId,
      interruptId:
        typeof parsed.interruptId === "string" ? parsed.interruptId : null,
    };
  } catch {
    return null;
  }
}

function writeStoredPending(pending: PendingApproval): void {
  if (typeof window === "undefined" || !pending.threadId) {
    return;
  }
  try {
    window.sessionStorage.setItem(
      pendingStorageKey(pending.threadId),
      JSON.stringify(pending),
    );
  } catch {
    /* quota / private mode */
  }
}

function clearStoredPending(threadId: string | null | undefined): void {
  if (!threadId || typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(pendingStorageKey(threadId));
  } catch {
    /* ignore */
  }
}

export type ToolEvent = {
  name: string;
  params: Record<string, unknown>;
  status: "running" | "complete" | "failed" | "awaiting_approval";
  stepIndex: number;
};

export type PendingApproval = {
  tool: string;
  args: Record<string, unknown>;
  threadId: string;
  interruptId: string | null;
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
  pendingApproval: PendingApproval | null;
  isResolvingApproval: boolean;
  sendMessage: (message: string) => Promise<void>;
  approvePending: () => Promise<void>;
  rejectPending: () => Promise<void>;
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

function markToolStatus(
  events: ToolEvent[],
  name: string,
  status: ToolEvent["status"],
): ToolEvent[] {
  const next = [...events];
  const index = [...next]
    .reverse()
    .findIndex(
      (event) =>
        event.name === name &&
        (event.status === "running" || event.status === "awaiting_approval"),
    );
  if (index >= 0) {
    const realIndex = next.length - 1 - index;
    next[realIndex] = { ...next[realIndex], status };
  }
  return next;
}

export function useAgentStream(
  initialThreadId?: string,
  initialMessages: ChatMessage[] = [],
): UseAgentStreamResult {
  const { guardStream } = useStreamGuard();
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>(() => {
    const stored = readStoredPending(initialThreadId);
    if (!stored) {
      return [];
    }
    return [
      {
        name: stored.tool,
        params: stored.args,
        status: "awaiting_approval",
        stepIndex: 1,
      },
    ];
  });
  const [stepsTaken, setStepsTaken] = useState(0);
  const [toolCallsMade, setToolCallsMade] = useState(0);
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutatedNotes, setMutatedNotes] = useState(false);
  const [pendingApproval, setPendingApproval] =
    useState<PendingApproval | null>(() => readStoredPending(initialThreadId));
  const [isResolvingApproval, setIsResolvingApproval] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const stepRef = useRef(0);
  const threadIdRef = useRef<string | null>(initialThreadId ?? null);

  const cancel = useCallback((): void => {
    abortRef.current?.abort();
  }, []);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const refreshNotes = useCallback(async (): Promise<void> => {
    if (workspaceId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notes(workspaceId),
      });
    }
  }, [queryClient, workspaceId]);

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
      setPendingApproval(null);
      clearStoredPending(threadIdRef.current);

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

      let sawToken = false;
      let sawDone = false;
      let sawApproval = false;
      let sawError = false;

      try {
        const res = await apiClient.stream(
          AGENT_STREAM_PATH,
          { message, thread_id: threadIdRef.current },
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
              sawToken = true;
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
            setToolEvents((current) => markToolStatus(current, name, "complete"));
            if (name === "create_note" || name === "update_note") {
              setMutatedNotes(true);
              await refreshNotes();
              toast.success(
                name === "create_note"
                  ? "Note created by agent"
                  : "Note updated by agent",
              );
            }
          }
          if (payload.type === "approval_required") {
            sawApproval = true;
            const tool = readStringField(payload, "tool") ?? "tool";
            const nextThread =
              readStringField(payload, "thread_id") ?? threadIdRef.current;
            if (nextThread) {
              threadIdRef.current = nextThread;
              setThreadId(nextThread);
            }
            setToolEvents((current) =>
              markToolStatus(current, tool, "awaiting_approval"),
            );
            const pending: PendingApproval = {
              tool,
              args: asRecord(payload.args),
              threadId: nextThread ?? "",
              interruptId: readStringField(payload, "interrupt_id"),
            };
            writeStoredPending(pending);
            setPendingApproval(pending);
          }
          if (payload.type === "done") {
            sawDone = true;
            const nextThread = readStringField(payload, "thread_id");
            if (nextThread) {
              threadIdRef.current = nextThread;
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
            sawError = true;
            setError(
              `${readStringField(payload, "message") ?? "Agent failed"}. Try Chat for a fast answer.`,
            );
          }
        }
        if (!sawToken && !sawDone && !sawApproval && !sawError) {
          setError(LLM_UNAVAILABLE_COPY);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (err instanceof AiUnavailableError) {
          setError(LLM_UNAVAILABLE_COPY);
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
    [guardStream, queryClient, refreshNotes, workspaceId],
  );

  const applyTurnResponse = useCallback(
    async (
      result: Awaited<ReturnType<typeof resumeAgentTurn>>,
      action: "approve" | "reject",
    ): Promise<void> => {
      const nextThread = result.thread_id;
      if (nextThread) {
        threadIdRef.current = nextThread;
        setThreadId(nextThread);
      }
      if (result.type === "approval_required" || result.status === "approval_required") {
        const pending: PendingApproval = {
          tool: result.tool ?? "tool",
          args: result.args ?? {},
          threadId: nextThread ?? threadIdRef.current ?? "",
          interruptId: result.interrupt_id ?? null,
        };
        writeStoredPending(pending);
        setPendingApproval(pending);
        return;
      }
      const tool = pendingApproval?.tool ?? "create_note";
      if (action === "approve") {
        setToolEvents((current) => markToolStatus(current, tool, "complete"));
        if (tool === "create_note" || tool === "update_note") {
          setMutatedNotes(true);
          await refreshNotes();
          toast.success(
            tool === "create_note"
              ? "Note created by agent"
              : "Note updated by agent",
          );
        }
      } else {
        setToolEvents((current) => markToolStatus(current, tool, "failed"));
      }
      const answer = result.answer ?? (action === "reject" ? "Request rejected." : "");
      if (answer) {
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last && last.role === "assistant" && last.content === "") {
            next[next.length - 1] = { ...last, content: answer };
            return next;
          }
          return [
            ...next,
            { role: "assistant", content: answer, id: nextId() },
          ];
        });
      }
      setPendingApproval(null);
      clearStoredPending(nextThread ?? threadIdRef.current);
    },
    [pendingApproval, refreshNotes],
  );

  const approvePending = useCallback(async (): Promise<void> => {
    if (!pendingApproval || isResolvingApproval) {
      return;
    }
    setIsResolvingApproval(true);
    setError(null);
    try {
      const body: { thread_id: string; interrupt_id?: string } = {
        thread_id: pendingApproval.threadId,
      };
      if (pendingApproval.interruptId) {
        body.interrupt_id = pendingApproval.interruptId;
      }
      const result = await resumeAgentTurn(body);
      await applyTurnResponse(result, "approve");
    } catch {
      setError(LLM_UNAVAILABLE_COPY);
    } finally {
      setIsResolvingApproval(false);
    }
  }, [applyTurnResponse, isResolvingApproval, pendingApproval]);

  const rejectPending = useCallback(async (): Promise<void> => {
    if (!pendingApproval || isResolvingApproval) {
      return;
    }
    setIsResolvingApproval(true);
    setError(null);
    try {
      const body: { thread_id: string; interrupt_id?: string } = {
        thread_id: pendingApproval.threadId,
      };
      if (pendingApproval.interruptId) {
        body.interrupt_id = pendingApproval.interruptId;
      }
      const result = await rejectAgentTurn(body);
      await applyTurnResponse(result, "reject");
    } catch {
      setError(LLM_UNAVAILABLE_COPY);
    } finally {
      setIsResolvingApproval(false);
    }
  }, [applyTurnResponse, isResolvingApproval, pendingApproval]);

  return {
    messages,
    toolEvents,
    stepsTaken,
    toolCallsMade,
    threadId,
    isStreaming,
    error,
    mutatedNotes,
    pendingApproval,
    isResolvingApproval,
    sendMessage,
    approvePending,
    rejectPending,
    cancel,
  };
}
