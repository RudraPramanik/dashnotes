"use client";

import { useEffect, useState } from "react";

import { RATE_LIMIT_EVENT } from "@/lib/api/client";

function isRateLimitEvent(
  event: Event,
): event is CustomEvent<{ retryAfter: number }> {
  return (
    event instanceof CustomEvent &&
    typeof event.detail === "object" &&
    event.detail !== null &&
    "retryAfter" in event.detail &&
    typeof event.detail.retryAfter === "number"
  );
}

export function RateLimitBanner() {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    function onLimited(event: Event): void {
      if (isRateLimitEvent(event)) {
        setSeconds(event.detail.retryAfter);
      }
    }
    window.addEventListener(RATE_LIMIT_EVENT, onLimited);
    return () => {
      window.removeEventListener(RATE_LIMIT_EVENT, onLimited);
    };
  }, []);

  useEffect(() => {
    if (seconds === null || seconds <= 0) {
      return;
    }
    const id = window.setInterval(() => {
      setSeconds((current) => {
        if (current === null || current <= 1) {
          return null;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [seconds]);

  if (seconds === null || seconds <= 0) {
    return null;
  }

  return (
    <div className="border-b bg-destructive/10 px-4 py-2 text-sm">
      Too many requests. Try again in {seconds}s.
    </div>
  );
}
