"use client";

import { Menu } from "lucide-react";

import { useShellStore } from "@/lib/stores/shell-store";
import { Button } from "@/components/ui/button";
import { AiStatusIndicator } from "@/components/shell/AiStatusIndicator";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { UserMenu } from "@/components/shell/UserMenu";

export function AppHeader() {
  const toggleSidebar = useShellStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 border-b bg-background px-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={toggleSidebar}
      >
        <Menu className="size-4" />
      </Button>
      <p className="hidden text-sm font-medium md:block">DashNotes</p>
      <div className="flex items-center gap-2">
        <AiStatusIndicator />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
