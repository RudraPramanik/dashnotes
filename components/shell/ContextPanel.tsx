"use client";

import type { ReactNode } from "react";

import { useShellStore } from "@/lib/stores/shell-store";

type ContextPanelProps = {
  children?: ReactNode;
};

export function ContextPanel({ children }: ContextPanelProps) {
  const contextPanelOpen = useShellStore((state) => state.contextPanelOpen);

  if (!contextPanelOpen || children === undefined) {
    return null;
  }

  return (
    <aside className="hidden w-[280px] overflow-y-auto border-l bg-card lg:block">
      {children}
    </aside>
  );
}
