"use client";

import { useEffect, useRef, useState } from "react";

import { useNoteMutations } from "@/lib/hooks/notes/use-note-mutations";
import { NoteActionsMenu } from "@/components/notes/NoteActionsMenu";
import { NoteBody } from "@/components/notes/NoteBody";
import { NotePrivacyToggle } from "@/components/notes/NotePrivacyToggle";
import { NoteTitleField } from "@/components/notes/NoteTitleField";
import { Button } from "@/components/ui/button";

type SaveState = "idle" | "saving" | "saved" | "error";

type NoteEditorProps = {
  noteId: string;
  initialContent: string;
  initialTitle: string;
  isPrivate: boolean;
};

export function NoteEditor({
  noteId,
  initialContent,
  initialTitle,
  isPrivate,
}: NoteEditorProps) {
  const { updateNote, deleteNote } = useNoteMutations();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lastSaveRef = useRef<(() => Promise<unknown>) | null>(null);

  useEffect(() => {
    if (saveState !== "saved" || savedAt === null) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [saveState, savedAt]);

  async function runSave(fn: () => Promise<unknown>): Promise<void> {
    lastSaveRef.current = fn;
    setSaveState("saving");
    try {
      await fn();
      setSavedAt(Date.now());
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function handleTitleSave(title: string): void {
    void runSave(() => updateNote(noteId, { title }));
  }

  function handleBodySave(content: string): void {
    void runSave(() => updateNote(noteId, { content }));
  }

  function handlePrivacyChange(nextPrivate: boolean): void {
    void runSave(() => updateNote(noteId, { is_private: nextPrivate }));
  }

  function handleDelete(): void {
    void deleteNote(noteId);
  }

  function handleCopyLink(): void {
    void navigator.clipboard.writeText(window.location.href);
  }

  const savedSeconds =
    savedAt !== null ? Math.max(0, Math.round((now - savedAt) / 1000)) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <NoteTitleField initialTitle={initialTitle} onSave={handleTitleSave} />
        </div>
        <NotePrivacyToggle
          isPrivate={isPrivate}
          onChange={handlePrivacyChange}
        />
        <NoteActionsMenu onDelete={handleDelete} onCopyLink={handleCopyLink} />
      </div>
      <NoteBody initialContent={initialContent} onSave={handleBodySave} />
      <p className="text-sm text-muted-foreground">
        {saveState === "saving" ? "Saving…" : null}
        {saveState === "saved"
          ? `Saved · ${savedSeconds}s ago`
          : null}
        {saveState === "error" ? (
          <span>
            Failed to save —{" "}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => {
                const last = lastSaveRef.current;
                if (last) {
                  void runSave(last);
                }
              }}
            >
              Retry
            </Button>
          </span>
        ) : null}
      </p>
    </div>
  );
}
