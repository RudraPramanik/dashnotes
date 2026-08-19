"use client";

import { MessageInput } from "@/components/chat/MessageInput";

type AgentInputProps = {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onCancel: () => void;
};

export function AgentInput({ onSend, isStreaming, onCancel }: AgentInputProps) {
  return (
    <MessageInput
      onSend={onSend}
      isStreaming={isStreaming}
      onCancel={onCancel}
      placeholder="Ask the assistant to search or create a note…"
      submitLabel="Run"
    />
  );
}
