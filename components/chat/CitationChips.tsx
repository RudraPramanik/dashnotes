"use client";

import Link from "next/link";

import type { ChatCitation } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";

type CitationChipsProps = {
  citations: ChatCitation[];
};

export function CitationChips({ citations }: CitationChipsProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-[42rem] flex-wrap gap-2 px-4 pb-2">
      {citations.map((citation) => (
        <Link
          key={`${citation.note_id}-${citation.chunk_id}`}
          href={`/notes/${citation.note_id}`}
        >
          <Badge variant="outline">{citation.title}</Badge>
        </Link>
      ))}
    </div>
  );
}
