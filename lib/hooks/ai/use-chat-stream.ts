"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CHAT_STREAM_PATH } from "@/lib/api/ai/chat";
import {
  AiUnavailableError,
  isApiError,
} from "@/lib/api/client";
import {
  parseCitations,
  parseSseJsonData,
  parseSseStream,
  readStringField,
} from "@/lib/api/sse-parser";
import type { ChatCitation } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { useStreamGuard } from "@/lib/hooks/use-stream-guard";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  id: string;
};

export type UseChatStreamResult = {
  messages: ChatMessage[];
  citations: ChatCitation[];
  threadId: string | null;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  cancel: () => void;
};

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useChatStream(
  initialThreadId?: string,
  initialMessages: ChatMessage[] = [],
): UseChatStreamResult {
  const { guardStream } = useStreamGuard();
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [citations, setCitations] = useState<ChatCitation[]>([]);
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
      setCitations([]);

      try {
        const res = await apiClient.stream(
          CHAT_STREAM_PATH,
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
          if (payload.type === "metadata") {
            setCitations(parseCitations(payload.citations));
            const nextThread = readStringField(payload, "thread_id");
            if (nextThread) {
              setThreadId(nextThread);
            }
          }
          if (payload.type === "error") {
            setError(
              readStringField(payload, "message") ??
                "Something went wrong. Please try again.",
            );
          }
        }

        if (workspaceId) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.threads(workspaceId),
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (err instanceof AiUnavailableError) {
          setError("LLM temporarily unavailable; retry shortly");
          return;
        }
        if (isApiError(err) && err.status === 429) {
          toast.error(
            `Too many requests. Try again in ${err.retryAfter ?? 60}s`,
          );
          setError(`Too many requests. Try again in ${err.retryAfter ?? 60}s`);
          return;
        }
        setError("Something went wrong. Please try again.");
      } finally {
        setIsStreaming(false);
      }
    },
    [guardStream, queryClient, threadId, workspaceId],
  );

  return {
    messages,
    citations,
    threadId,
    isStreaming,
    error,
    sendMessage,
    cancel,
  };
}
