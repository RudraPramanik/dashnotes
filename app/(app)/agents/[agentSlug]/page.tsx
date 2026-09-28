"use client";

import { useEffect, use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAgentStream } from "@/lib/hooks/ai/use-agent-stream";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useShellStore } from "@/lib/stores/shell-store";
import { AgentInput } from "@/components/agents/AgentInput";
import { AgentMessageList } from "@/components/agents/AgentMessageList";
import { ApprovalCard } from "@/components/agents/ApprovalCard";
import { SessionList } from "@/components/agents/SessionList";
import { ToolTracePanel } from "@/components/agents/ToolTracePanel";
import { AiErrorBoundary } from "@/components/errors/AiErrorBoundary";
import { ContextPanel } from "@/components/shell/ContextPanel";
import { ContextSheet } from "@/components/shell/ContextSheet";
import { Button } from "@/components/ui/button";

export default function AgentPage({
  params,
}: {
  params: Promise<{ agentSlug: string }>;
}) {
  const { agentSlug } = use(params);
  const router = useRouter();
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const belowLg = useMediaQuery("(max-width: 1023px)");
  const {
    messages,
    toolEvents,
    stepsTaken,
    isStreaming,
    error,
    mutatedNotes,
    threadId,
    pendingApproval,
    isResolvingApproval,
    sendMessage,
    approvePending,
    rejectPending,
    cancel,
  } = useAgentStream();

  useEffect(() => {
    if (agentSlug !== "workspace-assistant") {
      router.replace("/agents/workspace-assistant");
    }
  }, [agentSlug, router]);

  useEffect(() => {
    if (!belowLg) {
      openContextPanel();
    }
    return () => {
      closeContextPanel();
    };
  }, [belowLg, closeContextPanel, openContextPanel]);

  useEffect(() => {
    if (threadId && !isStreaming && !pendingApproval) {
      router.replace(`/agents/workspace-assistant/${threadId}`);
    }
  }, [isStreaming, pendingApproval, router, threadId]);

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col md:h-[calc(100dvh-5rem)]">
      <div className="flex shrink-0 items-center gap-2 border-b py-2 md:hidden">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setSessionsOpen(true)}
        >
          Sessions
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => openContextPanel()}
        >
          Tools
        </Button>
      </div>
      <div className="flex min-h-0 flex-1">
        <SessionList
          sheetOpen={sessionsOpen}
          onSheetOpenChange={setSessionsOpen}
        />
        <AiErrorBoundary>
          <div className="flex min-w-0 flex-1 flex-col">
            {mutatedNotes ? (
              <p className="border-b px-4 py-2 text-sm">
                The assistant changed a note. Open Notes if the list looks
                stale.
              </p>
            ) : null}
            <AgentMessageList messages={messages} isStreaming={isStreaming} />
            {pendingApproval ? (
              <ApprovalCard
                pending={pendingApproval}
                isResolving={isResolvingApproval}
                onApprove={() => void approvePending()}
                onReject={() => void rejectPending()}
              />
            ) : null}
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
        <ContextSheet title="Tools">
          <ToolTracePanel
            toolEvents={toolEvents}
            stepsTaken={stepsTaken}
            isStreaming={isStreaming}
          />
        </ContextSheet>
      </div>
    </div>
  );
}
