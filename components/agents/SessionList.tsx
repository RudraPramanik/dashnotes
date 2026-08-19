"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteThread } from "@/lib/api/ai/threads";
import { useThreads } from "@/lib/hooks/ai/use-threads";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";
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
import { Skeleton } from "@/components/ui/skeleton";

export function SessionList() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const { threads, isLoading, isError, isEmpty, refetch } = useThreads();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="w-60 space-y-2 border-r p-3">
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-60 space-y-2 border-r p-3">
        <p className="text-sm text-destructive">Could not load sessions.</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
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
      toast.success("Session deleted");
      if (pathname.includes(pendingDelete)) {
        router.push("/agents/workspace-assistant");
      }
    } catch {
      toast.error("Could not delete session");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sessions
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/agents/workspace-assistant">New</Link>
        </Button>
      </div>
      {isEmpty ? (
        <p className="px-3 text-sm text-muted-foreground">No sessions yet.</p>
      ) : (
        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          {threads.map((thread) => {
            const href = `/agents/workspace-assistant/${thread.id}`;
            const active = pathname === href;
            return (
              <div
                key={thread.id}
                className={`group flex items-center rounded-md ${active ? "bg-muted" : ""}`}
              >
                <Link
                  href={href}
                  className="min-w-0 flex-1 truncate px-2 py-1.5 text-sm hover:underline"
                >
                  {thread.title || "New session"}
                </Link>
                <button
                  type="button"
                  className="hidden px-2 text-xs group-hover:block"
                  aria-label="Delete session"
                  onClick={() => setPendingDelete(thread.id)}
                >
                  🗑
                </button>
              </div>
            );
          })}
        </nav>
      )}
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
            <AlertDialogTitle>Delete session?</AlertDialogTitle>
            <AlertDialogDescription>
              This hides the session from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
