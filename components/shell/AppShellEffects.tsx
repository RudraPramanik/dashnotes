"use client";

import { useAiHealth } from "@/lib/hooks/use-ai-health";
import { useAutomationNotifications } from "@/lib/hooks/use-automation-notifications";

export function AppShellEffects() {
  useAutomationNotifications();
  useAiHealth();
  return null;
}
