"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useChatStream } from "@/lib/hooks/ai/use-chat-stream";
import { CitationChips } from "@/components/chat/CitationChips";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { ThreadList } from "@/components/chat/ThreadList";
import { AiErrorBoundary } from "@/components/errors/AiErrorBoundary";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const router = useRouter();
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

  return (
    <div className="flex h-[calc(100dvh-8rem)]">
      <ThreadList />
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
                onClick={() => void sendMessage(messages.at(-2)?.content ?? "")}
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
    </div>
  );
}
