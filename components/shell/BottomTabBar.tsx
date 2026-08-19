"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FileText, Files, MessageSquare, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/files", label: "Files", icon: Files },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/agents/workspace-assistant", label: "Agent", icon: Bot },
  { href: "/settings/account", label: "More", icon: MoreHorizontal },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-background md:hidden">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground",
              active && "text-foreground",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
