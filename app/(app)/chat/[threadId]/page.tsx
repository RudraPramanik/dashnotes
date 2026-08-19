"use client";

import { useEffect, useMemo } from "react";
import { use } from "react";

import type { ChatMessage } from "@/lib/hooks/ai/use-chat-stream";
import { useChatStream } from "@/lib/hooks/ai/use-chat-stream";
import { useThreadMessages } from "@/lib/hooks/ai/use-thread-messages";
import { parseCitations } from "@/lib/api/sse-parser";
import { useShellStore } from "@/lib/stores/shell-store";
import { CitationChips } from "@/components/chat/CitationChips";
import { CitationPanel } from "@/components/chat/CitationPanel";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { ThreadList } from "@/components/chat/ThreadList";
import { AiErrorBoundary } from "@/components/errors/AiErrorBoundary";
import { ContextPanel } from "@/components/shell/ContextPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const { messages: stored, isLoading, isError, refetch } =
    useThreadMessages(threadId);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);

  const initialMessages = useMemo((): ChatMessage[] => {
    return stored.map((message) => ({
      id: message.id,
      role:
        message.role === "assistant" || message.role === "system"
          ? message.role
          : "user",
      content: message.content,
    }));
  }, [stored]);

  useEffect(() => {
    openContextPanel();
    return () => {
      closeContextPanel();
    };
  }, [closeContextPanel, openContextPanel]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-8rem)]">
        <ThreadList />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-2/3" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100dvh-8rem)]">
        <ThreadList />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="text-sm text-destructive">Could not load this conversation.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ChatThreadReady
      threadId={threadId}
      initialMessages={initialMessages}
      initialCitations={parseCitations(stored.at(-1)?.citations)}
    />
  );
}

function ChatThreadReady({
  threadId,
  initialMessages,
  initialCitations,
}: {
  threadId: string;
  initialMessages: ChatMessage[];
  initialCitations: ReturnType<typeof parseCitations>;
}) {
  const {
    messages,
    citations,
    isStreaming,
    error,
    sendMessage,
    cancel,
  } = useChatStream(threadId, initialMessages);
  const shownCitations = citations.length > 0 ? citations : initialCitations;

  return (
    <div className="flex h-[calc(100dvh-8rem)]">
      <ThreadList />
      <AiErrorBoundary>
        <div className="flex min-w-0 flex-1 flex-col">
          <MessageList messages={messages} isStreaming={isStreaming} />
          <CitationChips citations={shownCitations} />
          {error ? (
            <div className="mx-auto max-w-[42rem] px-4 pb-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <MessageInput
            onSend={(message) => void sendMessage(message)}
            isStreaming={isStreaming}
            onCancel={cancel}
          />
        </div>
      </AiErrorBoundary>
      <ContextPanel>
        <CitationPanel citations={shownCitations} isStreaming={isStreaming} />
      </ContextPanel>
    </div>
  );
}
