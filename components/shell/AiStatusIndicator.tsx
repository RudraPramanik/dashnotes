"use client";

import { useAiHealth } from "@/lib/hooks/use-ai-health";

export function AiStatusIndicator() {
  const { status, missing, isError } = useAiHealth();

  if (missing) {
    return null;
  }

  const color =
    isError || status === "unavailable"
      ? "bg-red-500"
      : status === "degraded"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      title={status ?? "AI status"}
    >
      AI
      <span className={`size-2 rounded-full ${color}`} />
    </span>
  );
}
