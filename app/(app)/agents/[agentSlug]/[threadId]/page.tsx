"use client";

import { useEffect, useMemo, useState } from "react";
import { use } from "react";
import Link from "next/link";

import type { ChatMessage } from "@/lib/hooks/ai/use-chat-stream";
import { useAgentStream } from "@/lib/hooks/ai/use-agent-stream";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useThreadMessages } from "@/lib/hooks/ai/use-thread-messages";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function AgentThreadPage({
  params,
}: {
  params: Promise<{ agentSlug: string; threadId: string }>;
}) {
  const { agentSlug, threadId } = use(params);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const { messages: stored, isLoading, isError, refetch } =
    useThreadMessages(threadId);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const belowLg = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    if (!belowLg) {
      openContextPanel();
    }
    return () => {
      closeContextPanel();
    };
  }, [belowLg, closeContextPanel, openContextPanel]);

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
        </div>
        <div className="flex min-h-0 flex-1">
          <SessionList
            sheetOpen={sessionsOpen}
            onSheetOpenChange={setSessionsOpen}
          />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <Skeleton className="h-16 w-full" />
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
            onClick={() => setSessionsOpen(true)}
          >
            Sessions
          </Button>
        </div>
        <div className="flex min-h-0 flex-1">
          <SessionList
            sheetOpen={sessionsOpen}
            onSheetOpenChange={setSessionsOpen}
          />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <p className="text-sm text-destructive">Could not load this session.</p>
            <Button variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AgentThreadReady
      threadId={threadId}
      initialMessages={initialMessages}
      sessionsOpen={sessionsOpen}
      onSessionsOpenChange={setSessionsOpen}
    />
  );
}

function AgentThreadReady({
  threadId,
  initialMessages,
  sessionsOpen,
  onSessionsOpenChange,
}: {
  threadId: string;
  initialMessages: ChatMessage[];
  sessionsOpen: boolean;
  onSessionsOpenChange: (open: boolean) => void;
}) {
  const {
    messages,
    toolEvents,
    stepsTaken,
    isStreaming,
    error,
    mutatedNotes,
    pendingApproval,
    isResolvingApproval,
    sendMessage,
    approvePending,
    rejectPending,
    cancel,
  } = useAgentStream(threadId, initialMessages);
  const openContextPanel = useShellStore((state) => state.openContextPanel);

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col md:h-[calc(100dvh-5rem)]">
      <div className="flex shrink-0 items-center gap-2 border-b py-2 md:hidden">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onSessionsOpenChange(true)}
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
          onSheetOpenChange={onSessionsOpenChange}
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
