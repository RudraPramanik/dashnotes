"use client";

import Link from "next/link";

import { useNoteMutations } from "@/lib/hooks/notes/use-note-mutations";
import { useNotes } from "@/lib/hooks/notes/use-notes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function NotesPageContent() {
  const { notes, isLoading, isError, isEmpty, refetch } = useNotes();
  const { createNote } = useNoteMutations();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-destructive">Could not load notes.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 py-12">
        <h1 className="text-2xl font-semibold">Start your workspace</h1>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Create a note</li>
          <li>Upload a file</li>
          <li>Ask Chat about it</li>
        </ol>
        <Button
          onClick={() =>
            void createNote({
              title: "Untitled note",
              content: "",
              is_private: true,
            })
          }
        >
          Create a note
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <Button
          onClick={() =>
            void createNote({
              title: "Untitled note",
              content: "",
              is_private: true,
            })
          }
        >
          New note
        </Button>
      </div>
      <ul className="divide-y rounded-lg border">
        {notes.map((note) => (
          <li key={note.id}>
            <Link
              href={`/notes/${note.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
            >
              <span>{note.title || "Untitled note"}</span>
              {note.is_private ? (
                <span className="text-xs text-muted-foreground">Private</span>
              ) : (
                <span className="text-xs text-muted-foreground">Public</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
