"use client";

import { useRouter } from "next/navigation";

import type { FileRecord } from "@/lib/api/types";
import { formatBytes, getFileIcon, getFileTypeLabel } from "@/lib/utils/file-icons";
import { getIndexingDisplay, getOptionalIndexingStatus } from "@/lib/utils/indexing-status";
import { Badge } from "@/components/ui/badge";

type FileCardProps = {
  file: FileRecord;
};

export function FileCard({ file }: FileCardProps) {
  const router = useRouter();
  const display = getIndexingDisplay(getOptionalIndexingStatus(file));

  return (
    <button
      type="button"
      onClick={() => router.push(`/files/${file.id}`)}
      className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-left hover:bg-muted/50"
    >
      <span className="text-2xl" aria-hidden>
        {getFileIcon(file.mime_type)}
      </span>
      <span className="truncate font-medium">{file.name}</span>
      <span className="text-xs text-muted-foreground">
        {getFileTypeLabel(file.mime_type)} · {formatBytes(file.size_bytes)}
      </span>
      <div className="flex gap-2">
        <Badge variant={display.variant}>{display.label}</Badge>
        {file.is_private ? (
          <Badge variant="outline">Private</Badge>
        ) : (
          <Badge variant="outline">Public</Badge>
        )}
      </div>
    </button>
  );
}
