"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { attachFileToNote } from "@/lib/api/files";
import { useFile } from "@/lib/hooks/files/use-file";
import { useNotes } from "@/lib/hooks/notes/use-notes";
import { getIndexingDisplay, getOptionalIndexingStatus } from "@/lib/utils/indexing-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FileMetaPanelProps = {
  fileId: string;
};

export function FileMetaPanel({ fileId }: FileMetaPanelProps) {
  const { file, isLoading, isError, pollingExceeded } = useFile(fileId);
  const { notes } = useNotes();
  const [noteId, setNoteId] = useState<string>("");
  const [attaching, setAttaching] = useState(false);
  const display = getIndexingDisplay(getOptionalIndexingStatus(file));

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading file…</p>;
  }

  if (isError || !file) {
    return (
      <p className="p-4 text-sm text-destructive">Could not load file meta.</p>
    );
  }

  async function onAttach(): Promise<void> {
    if (!noteId) {
      return;
    }
    setAttaching(true);
    try {
      await attachFileToNote(fileId, noteId);
      toast.success("Attached to note");
    } catch {
      toast.error("Could not attach file");
    } finally {
      setAttaching(false);
    }
  }

  return (
    <div className="space-y-3 p-4 text-sm">
      <p className="font-medium">File</p>
      <p>Visibility: {file.is_private ? "Private" : "Public"}</p>
      <Badge variant={display.variant}>
        {pollingExceeded ? "Still processing — check back later" : display.label}
      </Badge>
      {file.description ? <p>{file.description}</p> : null}
      <div className="space-y-2">
        <p className="text-muted-foreground">Attach to note</p>
        <Select value={noteId} onValueChange={setNoteId}>
          <SelectTrigger aria-label="Note to attach">
            <SelectValue placeholder="Select a note" />
          </SelectTrigger>
          <SelectContent>
            {notes.map((note) => (
              <SelectItem key={note.id} value={String(note.id)}>
                {note.title || "Untitled note"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={!noteId || attaching}
          onClick={() => void onAttach()}
        >
          {attaching ? "Attaching…" : "Attach"}
        </Button>
      </div>
      <Link
        href="/chat"
        className="inline-block underline-offset-4 hover:underline"
      >
        Ask about file →
      </Link>
    </div>
  );
}
