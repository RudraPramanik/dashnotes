"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useChatStream } from "@/lib/hooks/ai/use-chat-stream";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
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

export default function ChatPage() {
  const router = useRouter();
  const [threadsOpen, setThreadsOpen] = useState(false);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const belowLg = useMediaQuery("(max-width: 1023px)");
  const {
    messages,
    citations,
    threadId,
    isStreaming,
    error,
    sendMessage,
    cancel,
  } = useChatStream();

  useEffect(() => {
    if (threadId && !isStreaming) {
      router.replace(`/chat/${threadId}`);
    }
  }, [isStreaming, router, threadId]);

  useEffect(() => {
    if (!belowLg) {
      openContextPanel();
    }
    return () => {
      closeContextPanel();
    };
  }, [belowLg, closeContextPanel, openContextPanel]);

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
          onSheetOpenChange={setThreadsOpen}
        />
        <AiErrorBoundary>
          <div className="flex min-w-0 flex-1 flex-col">
            <MessageList messages={messages} isStreaming={isStreaming} />
            <CitationChips citations={citations} />
            {error ? (
              <div className="mx-auto max-w-[42rem] px-4 pb-2 text-sm text-destructive">
                {error}{" "}
                {error.includes("unavailable") ? (
                  <Link className="underline" href="/chat">
                    Stay in Chat
                  </Link>
                ) : null}
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() =>
                    void sendMessage(messages.at(-2)?.content ?? "")
                  }
                >
                  Retry
                </Button>
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
          <CitationPanel citations={citations} isStreaming={isStreaming} />
        </ContextPanel>
        <ContextSheet title="Sources">
          <CitationPanel citations={citations} isStreaming={isStreaming} />
        </ContextSheet>
      </div>
    </div>
  );
}
