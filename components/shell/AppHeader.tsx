"use client";

import { AiStatusIndicator } from "@/components/shell/AiStatusIndicator";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { UserMenu } from "@/components/shell/UserMenu";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 border-b bg-background px-3">
      <p className="text-sm font-medium">DashNotes</p>
      <div className="flex items-center gap-2">
        <AiStatusIndicator />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
