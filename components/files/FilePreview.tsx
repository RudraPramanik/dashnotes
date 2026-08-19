"use client";

import { useState } from "react";

import type { FileRecord } from "@/lib/api/types";
import { getFileIcon, resolveFileUrl } from "@/lib/utils/file-icons";

type FilePreviewProps = {
  file: FileRecord;
};

export function FilePreview({ file }: FilePreviewProps) {
  const [showMore, setShowMore] = useState(false);
  const url = resolveFileUrl(file.download_url);

  if (file.mime_type === "application/pdf" && file.download_url) {
    return (
      <iframe
        title={file.name}
        src={url}
        className="h-[480px] w-full rounded-lg border"
      />
    );
  }

  if (file.mime_type.startsWith("image/") && file.download_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={file.name}
        className="max-h-[480px] rounded-lg border object-contain"
      />
    );
  }

  if (file.mime_type.startsWith("text/")) {
    const preview = file.description ?? "";
    const text = showMore ? preview : preview.slice(0, 2000);
    return (
      <div className="space-y-2">
        <pre className="max-h-[320px] overflow-auto rounded-lg border bg-muted/30 p-3 text-xs">
          {text.length > 0 ? text : "No text preview yet. Open download after indexing."}
        </pre>
        {preview.length > 2000 ? (
          <button
            type="button"
            className="text-sm underline-offset-4 hover:underline"
            onClick={() => setShowMore((value) => !value)}
          >
            {showMore ? "Show less" : "Show more"}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border p-8">
      <span className="text-4xl" aria-hidden>
        {getFileIcon(file.mime_type)}
      </span>
      <p>{file.name}</p>
    </div>
  );
}
