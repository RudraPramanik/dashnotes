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
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lastSaveRef = useRef<(() => Promise<unknown>) | null>(null);
  const pendingContentSnapshotRef = useRef<{
    title: string;
    content: string;
  } | null>(null);
  const saveInFlightRef = useRef(false);
  const lastSaveClickAtRef = useRef(0);

  useEffect(() => {
    setTitle(initialTitle);
    setSavedTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setContent(initialContent);
    setSavedContent(initialContent);
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

  const isDirty = title !== savedTitle || content !== savedContent;
  const isSaving = saveState === "saving";
  const canSave = isDirty && !isSaving;

  function handleTitleChange(next: string): void {
    setTitle(next);
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleContentChange(next: string): void {
    setContent(next);
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  async function runSave(
    fn: () => Promise<unknown>,
    onSuccess?: () => void,
  ): Promise<void> {
    if (saveInFlightRef.current) {
      return;
    }
    saveInFlightRef.current = true;
    lastSaveRef.current = fn;
    setSaveState("saving");
    try {
      await fn();
      onSuccess?.();
      setSavedAt(Date.now());
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      saveInFlightRef.current = false;
    }
  }

  function applyPendingContentSnapshot(): void {
    const snap = pendingContentSnapshotRef.current;
    if (!snap) {
      return;
    }
    setSavedTitle(snap.title);
    setSavedContent(snap.content);
  }

  function handleSaveClick(): void {
    const clickedAt = Date.now();
    if (!canSave || saveInFlightRef.current) {
      return;
    }
    if (clickedAt - lastSaveClickAtRef.current < SAVE_CLICK_DEBOUNCE_MS) {
      return;
    }
    lastSaveClickAtRef.current = clickedAt;
    const titleToSave = title;
    const contentToSave = content;
    pendingContentSnapshotRef.current = {
      title: titleToSave,
      content: contentToSave,
    };
    void runSave(
      () => updateNote(noteId, { title: titleToSave, content: contentToSave }),
      applyPendingContentSnapshot,
    );
  }

  function handleRetry(): void {
    const last = lastSaveRef.current;
    if (!last || saveInFlightRef.current || saveState === "saving") {
      return;
    }
    void runSave(last, applyPendingContentSnapshot);
  }

  function handlePrivacyChange(nextPrivate: boolean): void {
    pendingContentSnapshotRef.current = null;
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
  const showNoteSaved = saveState === "saved" && !isDirty;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <NoteTitleField
            initialTitle={initialTitle}
            onChange={handleTitleChange}
          />
        </div>
        <Button
          type="button"
          onClick={handleSaveClick}
          disabled={!canSave}
          aria-busy={isSaving}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <NotePrivacyToggle
          isPrivate={isPrivate}
          onChange={handlePrivacyChange}
        />
        <NoteActionsMenu onDelete={handleDelete} onCopyLink={handleCopyLink} />
      </div>
      <NoteBody
        initialContent={initialContent}
        onChange={handleContentChange}
      />
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {saveState === "saving" ? "Saving…" : null}
        {showNoteSaved
          ? `Note saved · ${savedSeconds}s ago`
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
