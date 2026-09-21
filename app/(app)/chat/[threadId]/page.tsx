"use client";

import { useEffect, useMemo, useState } from "react";
import { use } from "react";

import type { ChatMessage } from "@/lib/hooks/ai/use-chat-stream";
import { useChatStream } from "@/lib/hooks/ai/use-chat-stream";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
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
import { ContextSheet } from "@/components/shell/ContextSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const { messages: stored, isLoading, isError, refetch } =
    useThreadMessages(threadId);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const belowLg = useMediaQuery("(max-width: 1023px)");

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
    if (!belowLg) {
      openContextPanel();
    }
    return () => {
      closeContextPanel();
    };
  }, [belowLg, closeContextPanel, openContextPanel]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-7.5rem)] flex-col md:h-[calc(100dvh-5rem)]">
        <div className="flex shrink-0 items-center gap-2 border-b py-2 md:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setThreadsOpen(true)}
          >
            Conversations
          </Button>
        </div>
        <div className="flex min-h-0 flex-1">
          <ThreadList
            sheetOpen={threadsOpen}
            onSheetOpenChange={setThreadsOpen}
          />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100dvh-7.5rem)] flex-col md:h-[calc(100dvh-5rem)]">
        <div className="flex shrink-0 items-center gap-2 border-b py-2 md:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setThreadsOpen(true)}
          >
            Conversations
          </Button>
        </div>
        <div className="flex min-h-0 flex-1">
          <ThreadList
            sheetOpen={threadsOpen}
            onSheetOpenChange={setThreadsOpen}
          />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <p className="text-sm text-destructive">
              Could not load this conversation.
            </p>
            <Button variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatThreadReady
      threadId={threadId}
      initialMessages={initialMessages}
      initialCitations={parseCitations(stored.at(-1)?.citations)}
      threadsOpen={threadsOpen}
      onThreadsOpenChange={setThreadsOpen}
    />
  );
}

function ChatThreadReady({
  threadId,
  initialMessages,
  initialCitations,
  threadsOpen,
  onThreadsOpenChange,
}: {
  threadId: string;
  initialMessages: ChatMessage[];
  initialCitations: ReturnType<typeof parseCitations>;
  threadsOpen: boolean;
  onThreadsOpenChange: (open: boolean) => void;
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
  const openContextPanel = useShellStore((state) => state.openContextPanel);

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col md:h-[calc(100dvh-5rem)]">
      <div className="flex shrink-0 items-center gap-2 border-b py-2 md:hidden">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onThreadsOpenChange(true)}
        >
          Conversations
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => openContextPanel()}
        >
          Sources
        </Button>
      </div>
      <div className="flex min-h-0 flex-1">
        <ThreadList
          sheetOpen={threadsOpen}
          onSheetOpenChange={onThreadsOpenChange}
        />
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
          <CitationPanel
            citations={shownCitations}
            isStreaming={isStreaming}
          />
        </ContextPanel>
        <ContextSheet title="Sources">
          <CitationPanel
            citations={shownCitations}
            isStreaming={isStreaming}
          />
        </ContextSheet>
      </div>
    </div>
  );
}
