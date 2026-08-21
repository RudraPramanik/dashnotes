"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const NoteEditorPageContent = dynamic(
  () =>
    import("@/components/notes/NoteEditorPageContent").then((mod) => ({
      default: mod.NoteEditorPageContent,
    })),
  { ssr: false },
);

export default function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = use(params);
  return <NoteEditorPageContent noteId={noteId} />;
}
