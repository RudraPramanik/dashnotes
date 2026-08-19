"use client";

import { useEffect, useMemo } from "react";
import { use } from "react";
import Link from "next/link";

import type { ChatMessage } from "@/lib/hooks/ai/use-chat-stream";
import { useAgentStream } from "@/lib/hooks/ai/use-agent-stream";
import { useThreadMessages } from "@/lib/hooks/ai/use-thread-messages";
import { useShellStore } from "@/lib/stores/shell-store";
import { AgentInput } from "@/components/agents/AgentInput";
import { AgentMessageList } from "@/components/agents/AgentMessageList";
import { SessionList } from "@/components/agents/SessionList";
import { ToolTracePanel } from "@/components/agents/ToolTracePanel";
import { AiErrorBoundary } from "@/components/errors/AiErrorBoundary";
import { ContextPanel } from "@/components/shell/ContextPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgentThreadPage({
  params,
}: {
  params: Promise<{ agentSlug: string; threadId: string }>;
}) {
  const { agentSlug, threadId } = use(params);
  const { messages: stored, isLoading, isError, refetch } =
    useThreadMessages(threadId);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);

  useEffect(() => {
    openContextPanel();
    return () => {
      closeContextPanel();
    };
  }, [closeContextPanel, openContextPanel]);

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

  if (agentSlug !== "workspace-assistant") {
    return (
      <p className="p-4 text-sm">
        Unknown agent.{" "}
        <Link className="underline" href="/agents/workspace-assistant">
          Open Workspace Assistant
        </Link>
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-8rem)]">
        <SessionList />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100dvh-8rem)]">
        <SessionList />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="text-sm text-destructive">Could not load this session.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AgentThreadReady threadId={threadId} initialMessages={initialMessages} />
  );
}

function AgentThreadReady({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: ChatMessage[];
}) {
  const {
    messages,
    toolEvents,
    stepsTaken,
    isStreaming,
    error,
    mutatedNotes,
    sendMessage,
    cancel,
  } = useAgentStream(threadId, initialMessages);

  return (
    <div className="flex h-[calc(100dvh-8rem)]">
      <SessionList />
      <AiErrorBoundary>
        <div className="flex min-w-0 flex-1 flex-col">
          {mutatedNotes ? (
            <p className="border-b px-4 py-2 text-sm">
              The assistant changed a note. Open Notes if the list looks stale.
            </p>
          ) : null}
          <AgentMessageList messages={messages} isStreaming={isStreaming} />
          {error ? (
            <div className="mx-auto max-w-[42rem] px-4 pb-2 text-sm text-destructive">
              {error}{" "}
              <Link className="underline" href="/chat">
                Open Chat
              </Link>
            </div>
          ) : null}
          <AgentInput
            onSend={(message) => void sendMessage(message)}
            isStreaming={isStreaming}
            onCancel={cancel}
          />
        </div>
      </AiErrorBoundary>
      <ContextPanel>
        <ToolTracePanel
          toolEvents={toolEvents}
          stepsTaken={stepsTaken}
          isStreaming={isStreaming}
        />
      </ContextPanel>
    </div>
  );
}
