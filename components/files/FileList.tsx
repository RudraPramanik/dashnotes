"use client";

import Link from "next/link";

import type { FileRecord } from "@/lib/api/types";
import { formatBytes, getFileIcon, getFileTypeLabel } from "@/lib/utils/file-icons";
import { getIndexingDisplay, getOptionalIndexingStatus } from "@/lib/utils/indexing-status";

type FileListProps = {
  files: FileRecord[];
};

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Size</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const display = getIndexingDisplay(getOptionalIndexingStatus(file));
            return (
              <tr key={file.id} className="border-t">
                <td className="px-3 py-2">
                  <Link
                    href={`/files/${file.id}`}
                    className="hover:underline"
                  >
                    {getFileIcon(file.mime_type)} {file.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {getFileTypeLabel(file.mime_type)}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {display.label}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatBytes(file.size_bytes)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
