"use client";

import { useState } from "react";

import type { ToolEvent } from "@/lib/hooks/ai/use-agent-stream";
import { Button } from "@/components/ui/button";

type ToolTracePanelProps = {
  toolEvents: ToolEvent[];
  stepsTaken: number;
  isStreaming: boolean;
};

function humanToolName(name: string): string {
  if (name === "search_notes") {
    return "Search notes";
  }
  if (name === "create_note") {
    return "Create note";
  }
  if (name === "update_note") {
    return "Update note";
  }
  return name.replaceAll("_", " ");
}

export function ToolTracePanel({
  toolEvents,
  stepsTaken,
  isStreaming,
}: ToolTracePanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (toolEvents.length === 0 && isStreaming) {
    return (
      <p className="p-4 text-sm text-muted-foreground">Waiting for agent…</p>
    );
  }

  if (toolEvents.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">No tools used yet</p>
    );
  }

  return (
    <div className="space-y-3 p-4 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          Step {stepsTaken || toolEvents.length} of {toolEvents.length}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setExpanded((value) => !value)}
        >
          Expand all
        </Button>
      </div>
      <ul className="space-y-2">
        {toolEvents.map((event) => {
          const params = JSON.stringify(event.params);
          const truncated =
            params.length > 40 ? `${params.slice(0, 40)}…` : params;
          const icon =
            event.status === "running"
              ? "…"
              : event.status === "complete"
                ? "✓"
                : "✗";
          return (
            <li key={`${event.name}-${event.stepIndex}`} className="rounded-md border p-2">
              <p>
                {event.stepIndex}. {humanToolName(event.name)} {icon}
              </p>
              <p className="text-xs text-muted-foreground">{truncated}</p>
              {expanded ? (
                <pre className="mt-2 overflow-x-auto text-xs">{params}</pre>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
