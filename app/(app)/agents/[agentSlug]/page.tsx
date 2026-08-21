"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAgentStream } from "@/lib/hooks/ai/use-agent-stream";
import { useShellStore } from "@/lib/stores/shell-store";
import { AgentInput } from "@/components/agents/AgentInput";
import { AgentMessageList } from "@/components/agents/AgentMessageList";
import { SessionList } from "@/components/agents/SessionList";
import { ToolTracePanel } from "@/components/agents/ToolTracePanel";
import { AiErrorBoundary } from "@/components/errors/AiErrorBoundary";
import { ContextPanel } from "@/components/shell/ContextPanel";

export default function AgentPage({
  params,
}: {
  params: Promise<{ agentSlug: string }>;
}) {
  const { agentSlug } = use(params);
  const router = useRouter();
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const {
    messages,
    toolEvents,
    stepsTaken,
    isStreaming,
    error,
    mutatedNotes,
    threadId,
    sendMessage,
    cancel,
  } = useAgentStream();

  useEffect(() => {
    if (agentSlug !== "workspace-assistant") {
      router.replace("/agents/workspace-assistant");
    }
  }, [agentSlug, router]);

  useEffect(() => {
    openContextPanel();
    return () => {
      closeContextPanel();
    };
  }, [closeContextPanel, openContextPanel]);

  useEffect(() => {
    if (threadId && !isStreaming) {
      router.replace(`/agents/workspace-assistant/${threadId}`);
    }
  }, [isStreaming, router, threadId]);

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
