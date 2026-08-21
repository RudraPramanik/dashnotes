"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileText,
  Files,
  MessageSquare,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { WorkspaceLabel } from "@/components/shell/WorkspaceLabel";

export function AppSidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const settingsHref =
    role === "member" ? "/settings/account" : "/settings/workspace";

  const items = [
    { href: "/notes", label: "Notes", icon: FileText },
    { href: "/files", label: "Files", icon: Files },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/agents/workspace-assistant", label: "Agent", icon: Bot },
    { href: settingsHref, label: "Settings", icon: Settings },
  ] as const;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="border-b py-4">
        <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Workspace
        </p>
        <WorkspaceLabel />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href) ||
            (item.label === "Settings" && pathname.startsWith("/settings"));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent",
                active && "bg-sidebar-accent font-medium",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
