"use client";

import type { FileRecord } from "@/lib/api/types";
import { FileCard } from "@/components/files/FileCard";

type FileGridProps = {
  files: FileRecord[];
};

export function FileGrid({ files }: FileGridProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
