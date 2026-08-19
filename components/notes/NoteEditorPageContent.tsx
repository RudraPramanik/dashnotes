"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { useNote } from "@/lib/hooks/notes/use-note";
import { useShellStore } from "@/lib/stores/shell-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContextPanel } from "@/components/shell/ContextPanel";
import { NoteOutlinePanel } from "@/components/notes/NoteOutlinePanel";

const NoteEditor = dynamic(
  () =>
    import("@/components/notes/NoteEditor").then((mod) => ({
      default: mod.NoteEditor,
    })),
  { ssr: false },
);

type NoteEditorPageContentProps = {
  noteId: string;
};

export function NoteEditorPageContent({ noteId }: NoteEditorPageContentProps) {
  const { note, isLoading, isError, refetch } = useNote(noteId);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const [lagStartedAt, setLagStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    openContextPanel();
    const raw = sessionStorage.getItem(`dashnotes_index_lag_${noteId}`);
    if (raw) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed)) {
        setLagStartedAt(parsed);
      }
    }
    return () => {
      closeContextPanel();
    };
  }, [closeContextPanel, noteId, openContextPanel]);

  useEffect(() => {
    if (lagStartedAt === null) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 5000);
    return () => {
      window.clearInterval(id);
    };
  }, [lagStartedAt]);

  const isLagging =
    lagStartedAt !== null && now - lagStartedAt < 60_000;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-destructive">Note not found</p>
        <Button variant="outline" asChild>
          <Link href="/notes">Back to notes</Link>
        </Button>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="min-w-0 flex-1">
        {isLagging ? (
          <p className="mb-3 text-sm text-muted-foreground">
            Indexing… Searchable in about a minute. This is not an AI outage.
          </p>
        ) : null}
        <NoteEditor
          noteId={String(note.id)}
          initialTitle={note.title}
          initialContent={note.content}
          isPrivate={note.is_private}
        />
      </div>
      <ContextPanel>
        <NoteOutlinePanel noteId={noteId} />
      </ContextPanel>
    </div>
  );
}
