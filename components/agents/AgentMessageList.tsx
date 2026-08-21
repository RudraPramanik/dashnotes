"use client";

import type { ChatMessage } from "@/lib/hooks/ai/use-chat-stream";
import { MessageList } from "@/components/chat/MessageList";

type AgentMessageListProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
};

export function AgentMessageList({
  messages,
  isStreaming,
}: AgentMessageListProps) {
  return <MessageList messages={messages} isStreaming={isStreaming} />;
}
