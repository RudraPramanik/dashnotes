"use client";

import { useEffect, useRef, useState } from "react";

import type { IndexingStatus } from "@/lib/api/types";
import { shouldPoll } from "@/lib/utils/indexing-status";

export type IndexingPollState = {
  refetchInterval: number | false;
  pollingExceeded: boolean;
  resetPoll: () => void;
};

export function useIndexingPoll(
  status: IndexingStatus | undefined | null,
  timeoutMs = 180_000,
): IndexingPollState {
  const startedAtRef = useRef<number | null>(null);
  const [pollingExceeded, setPollingExceeded] = useState(false);

  if (shouldPoll(status) && startedAtRef.current === null) {
    startedAtRef.current = Date.now();
  }

  useEffect(() => {
    if (!shouldPoll(status) || pollingExceeded) {
      return;
    }
    const id = window.setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt !== null && Date.now() - startedAt > timeoutMs) {
        setPollingExceeded(true);
      }
    }, 5000);
    return () => {
      window.clearInterval(id);
    };
  }, [pollingExceeded, status, timeoutMs]);

  function resetPoll(): void {
    startedAtRef.current = Date.now();
    setPollingExceeded(false);
  }

  const refetchInterval: number | false =
    !pollingExceeded && shouldPoll(status) ? 5000 : false;

  return { refetchInterval, pollingExceeded, resetPoll };
}
