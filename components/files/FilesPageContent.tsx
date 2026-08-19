"use client";

import { useState } from "react";

import { useFiles } from "@/lib/hooks/files/use-files";
import { FileGrid } from "@/components/files/FileGrid";
import { FileList } from "@/components/files/FileList";
import { UploadDropzone } from "@/components/files/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function FilesPageContent() {
  const { files, isLoading, isError, isEmpty, refetch } = useFiles();
  const [view, setView] = useState<"grid" | "list">("grid");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-destructive">Could not load files.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Files</h1>
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            Grid
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            List
          </Button>
        </div>
      </div>
      <UploadDropzone />
      {isEmpty ? (
        <p className="text-sm text-muted-foreground">
          Upload a file to ground Chat and Agent in your documents.
        </p>
      ) : view === "grid" ? (
        <FileGrid files={files} />
      ) : (
        <FileList files={files} />
      )}
    </div>
  );
}
