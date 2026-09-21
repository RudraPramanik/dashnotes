"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteThread, renameThread } from "@/lib/api/ai/threads";
import { useThreads } from "@/lib/hooks/ai/use-threads";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

type ThreadListProps = {
  sheetOpen?: boolean;
  onSheetOpenChange?: (open: boolean) => void;
};

function groupLabel(iso: string): "Today" | "Yesterday" | "Older" {
  const date = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  if (date >= startToday) {
    return "Today";
  }
  if (date >= startYesterday) {
    return "Yesterday";
  }
  return "Older";
}

export function ThreadList({
  sheetOpen = false,
  onSheetOpenChange,
}: ThreadListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const { threads, isLoading, isError, isEmpty, refetch } = useThreads();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function closeSheet(): void {
    onSheetOpenChange?.(false);
  }

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete) {
      return;
    }
    try {
      await deleteThread(pendingDelete);
      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.threads(workspaceId),
        });
      }
      toast.success("Conversation deleted");
      if (pathname.includes(pendingDelete)) {
        router.push("/chat");
      }
      closeSheet();
    } catch {
      toast.error("Could not delete conversation");
    } finally {
      setPendingDelete(null);
    }
  }

  async function handleRename(
    threadId: string,
    currentTitle: string | null,
  ): Promise<void> {
    const next = window.prompt(
      "Rename conversation",
      currentTitle || "New conversation",
    );
    if (next === null) {
      return;
    }
    const title = next.trim();
    if (!title) {
      toast.error("Title must not be empty");
      return;
    }
    try {
      await renameThread(threadId, title);
      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.threads(workspaceId),
        });
      }
      toast.success("Conversation renamed");
    } catch {
      toast.error("Could not rename conversation");
    }
  }

  function renderBody(actionsAlwaysVisible: boolean): ReactNode {
    if (isLoading) {
      return (
        <div className="space-y-2 p-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="space-y-2 p-3">
          <p className="text-sm text-destructive">Could not load conversations.</p>
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    const groups: Record<"Today" | "Yesterday" | "Older", typeof threads> = {
      Today: [],
      Yesterday: [],
      Older: [],
    };
    for (const thread of threads) {
      groups[groupLabel(thread.updated_at)].push(thread);
    }

    return (
      <>
        <div className="flex items-center justify-between p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your conversations
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link href="/chat" onClick={closeSheet}>
              New
            </Link>
          </Button>
        </div>
        {isEmpty ? (
          <p className="px-3 text-sm text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <nav className="flex-1 overflow-y-auto px-2 pb-3">
            {(["Today", "Yesterday", "Older"] as const).map((label) =>
              groups[label].length === 0 ? null : (
                <div key={label} className="mb-3">
                  <p className="px-2 py-1 text-xs text-muted-foreground">
                    {label}
                  </p>
                  {groups[label].map((thread) => {
                    const href = `/chat/${thread.id}`;
                    const active = pathname === href;
                    return (
                      <div
                        key={thread.id}
                        className={`group flex items-center rounded-md ${active ? "bg-muted" : ""}`}
                      >
                        <Link
                          href={href}
                          className="min-w-0 flex-1 truncate px-2 py-1.5 text-sm hover:underline"
                          onClick={closeSheet}
                        >
                          {thread.title || "New conversation"}
                        </Link>
                        <button
                          type="button"
                          className={
                            actionsAlwaysVisible
                              ? "px-1 text-xs"
                              : "hidden px-1 text-xs group-hover:block"
                          }
                          aria-label="Rename conversation"
                          onClick={() =>
                            void handleRename(thread.id, thread.title)
                          }
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className={
                            actionsAlwaysVisible
                              ? "px-2 text-xs"
                              : "hidden px-2 text-xs group-hover:block"
                          }
                          aria-label="Delete conversation"
                          onClick={() => setPendingDelete(thread.id)}
                        >
                          🗑
                        </button>
                      </div>
                    );
                  })}
                </div>
              ),
            )}
          </nav>
        )}
      </>
    );
  }

  return (
    <>
      <div className="hidden h-full w-60 shrink-0 flex-col border-r md:flex">
        {renderBody(false)}
      </div>
      {onSheetOpenChange ? (
        <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
          <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Conversations</SheetTitle>
              <SheetDescription>
                Your chat conversations in this workspace
              </SheetDescription>
            </SheetHeader>
            <div className="flex h-full flex-col pt-10">
              {renderBody(true)}
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This hides the thread from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
