"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import { TiptapErrorBoundary } from "@/components/errors/TiptapErrorBoundary";

type NoteBodyProps = {
  initialContent: string;
  onSave: (content: string) => void;
};

export function NoteBody({ initialContent, onSave }: NoteBodyProps) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const timerRef = useRef<number | null>(null);
  const [characters, setCharacters] = useState(0);
  const [words, setWords] = useState(0);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
      CharacterCount,
    ],
    content: initialContent.length > 0 ? initialContent : "",
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[320px] rounded-lg border bg-background p-3 text-sm outline-none",
        "aria-label": "Note content",
      },
    },
    onUpdate: ({ editor: current }) => {
      const text = current.getText();
      setCharacters(text.length);
      setWords(text.split(/\s+/).filter(Boolean).length);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        onSaveRef.current(current.getHTML());
      }, 1500);
    },
  });

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const current = editor.getHTML();
    if (initialContent && initialContent !== current) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const text = editor.getText();
    setCharacters(text.length);
    setWords(text.split(/\s+/).filter(Boolean).length);
  }, [editor]);

  return (
    <div className="flex flex-col gap-2">
      <TiptapErrorBoundary>
        <EditorContent editor={editor} />
      </TiptapErrorBoundary>
      <p className="text-xs text-muted-foreground">
        {words} words · {characters} characters
      </p>
    </div>
  );
}
