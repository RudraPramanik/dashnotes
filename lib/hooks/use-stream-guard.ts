"use client";

import { refreshIfNeeded } from "@/lib/auth/token-refresh";

export type StreamGuard = {
  guardStream: () => Promise<boolean>;
};

export function useStreamGuard(): StreamGuard {
  async function guardStream(): Promise<boolean> {
    const ok = await refreshIfNeeded();
    return ok;
  }

  return { guardStream };
}
