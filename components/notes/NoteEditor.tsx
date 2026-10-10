"use client";

import { useEffect, useRef, useState } from "react";

import { useNoteMutations } from "@/lib/hooks/notes/use-note-mutations";
import { NoteActionsMenu } from "@/components/notes/NoteActionsMenu";
import { NoteBody } from "@/components/notes/NoteBody";
import { NotePrivacyToggle } from "@/components/notes/NotePrivacyToggle";
import { NoteTitleField } from "@/components/notes/NoteTitleField";
import { Button } from "@/components/ui/button";

type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_CLICK_DEBOUNCE_MS = 300;

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
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lastSaveRef = useRef<(() => Promise<unknown>) | null>(null);
  const saveInFlightRef = useRef(false);
  const lastSaveClickAtRef = useRef(0);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

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
    if (saveInFlightRef.current) {
      return;
    }
    saveInFlightRef.current = true;
    lastSaveRef.current = fn;
    setSaveState("saving");
    try {
      await fn();
      setSavedAt(Date.now());
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      saveInFlightRef.current = false;
    }
  }

  function handleSaveClick(): void {
    const clickedAt = Date.now();
    if (saveInFlightRef.current || saveState === "saving") {
      return;
    }
    if (clickedAt - lastSaveClickAtRef.current < SAVE_CLICK_DEBOUNCE_MS) {
      return;
    }
    lastSaveClickAtRef.current = clickedAt;
    void runSave(() => updateNote(noteId, { title, content }));
  }

  function handleRetry(): void {
    const last = lastSaveRef.current;
    if (!last || saveInFlightRef.current || saveState === "saving") {
      return;
    }
    void runSave(last);
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
  const isSaving = saveState === "saving";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          aria-busy={isSaving}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <div className="min-w-0 flex-1">
          <NoteTitleField initialTitle={initialTitle} onChange={setTitle} />
        </div>
        <NotePrivacyToggle
          isPrivate={isPrivate}
          onChange={handlePrivacyChange}
        />
        <NoteActionsMenu onDelete={handleDelete} onCopyLink={handleCopyLink} />
      </div>
      <NoteBody initialContent={initialContent} onChange={setContent} />
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
              onClick={handleRetry}
              disabled={isSaving}
            >
              Retry
            </Button>
          </span>
        ) : null}
      </p>
    </div>
  );
}
