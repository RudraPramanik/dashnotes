"use client";

import { useEffect, useState } from "react";

import { AI_UNAVAILABLE_EVENT, AiUnavailableError } from "@/lib/api/client";
import { useAiHealth } from "@/lib/hooks/use-ai-health";

type AiDegradationBannerProps = {
  aiError?: Error | null;
};

export function AiDegradationBanner({ aiError = null }: AiDegradationBannerProps) {
  const { status, isError } = useAiHealth();
  const [fromEvent, setFromEvent] = useState(false);
  const fromStream = aiError instanceof AiUnavailableError;
  const show =
    fromStream ||
    fromEvent ||
    isError ||
    status === "unavailable" ||
    status === "degraded";

  useEffect(() => {
    function onUnavailable(): void {
      setFromEvent(true);
    }
    window.addEventListener(AI_UNAVAILABLE_EVENT, onUnavailable);
    return () => {
      window.removeEventListener(AI_UNAVAILABLE_EVENT, onUnavailable);
    };
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="border-b bg-amber-500/10 px-4 py-2 text-sm">
      AI features are temporarily unavailable. Notes and files work normally.
    </div>
  );
}
