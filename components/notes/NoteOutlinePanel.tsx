"use client";

import Link from "next/link";

import { useNote } from "@/lib/hooks/notes/use-note";
import { getIndexingDisplay } from "@/lib/utils/indexing-status";
import { getOptionalIndexingStatus } from "@/lib/utils/indexing-status";
import { Badge } from "@/components/ui/badge";

type NoteOutlinePanelProps = {
  noteId: string;
};

export function NoteOutlinePanel({ noteId }: NoteOutlinePanelProps) {
  const { note, isLoading, isError, pollingExceeded } = useNote(noteId);
  const display = getIndexingDisplay(getOptionalIndexingStatus(note));

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading note…</p>;
  }

  if (isError || !note) {
    return (
      <p className="p-4 text-sm text-destructive">Could not load note meta.</p>
    );
  }

  return (
    <div className="space-y-3 p-4 text-sm">
      <p className="font-medium">Note</p>
      <p>Visibility: {note.is_private ? "Private" : "Public"}</p>
      <Badge variant={display.variant}>
        {pollingExceeded ? "Still processing — check back later" : display.label}
      </Badge>
      <Link
        href="/chat"
        className="inline-block text-sm underline-offset-4 hover:underline"
      >
        Ask about this →
      </Link>
    </div>
  );
}
