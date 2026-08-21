"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/lib/hooks/ai/use-chat-stream";
import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { SystemMessage } from "@/components/chat/SystemMessage";
import { UserMessage } from "@/components/chat/UserMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

type MessageListProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
};

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-center text-muted-foreground">
          Ask about your notes and files
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto flex max-w-[42rem] flex-col gap-4 px-4 py-6">
        {messages.map((message, index) => {
          const streamingHere =
            isStreaming &&
            index === messages.length - 1 &&
            message.role === "assistant";
          if (message.role === "user") {
            return <UserMessage key={message.id} content={message.content} />;
          }
          if (message.role === "system") {
            return <SystemMessage key={message.id} content={message.content} />;
          }
          return (
            <AssistantMessage
              key={message.id}
              content={message.content}
              isStreaming={streamingHere}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
