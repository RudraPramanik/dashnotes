"use client";

import Link from "next/link";

import type { ChatCitation } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";

type CitationPanelProps = {
  citations: ChatCitation[];
  isStreaming?: boolean;
};

function scoreVariant(
  score: number,
): "default" | "secondary" | "outline" {
  if (score > 0.7) {
    return "default";
  }
  if (score > 0.4) {
    return "secondary";
  }
  return "outline";
}

export function CitationPanel({
  citations,
  isStreaming = false,
}: CitationPanelProps) {
  if (isStreaming && citations.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Searching your workspace…
      </p>
    );
  }

  if (!isStreaming && citations.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">No sources found</p>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <p className="text-sm font-medium">Sources</p>
      <ul className="space-y-2">
        {citations.map((citation) => (
          <li
            key={`${citation.note_id}-${citation.chunk_id}`}
            className="rounded-lg border p-3 text-sm"
          >
            <p>📝 {citation.title}</p>
            <Badge variant={scoreVariant(citation.relevance_score)}>
              {citation.relevance_score.toFixed(2)}
            </Badge>
            <Link
              href={`/notes/${citation.note_id}`}
              className="mt-2 block underline-offset-4 hover:underline"
            >
              Open note
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
