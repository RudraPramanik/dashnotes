"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import { useFileUpload } from "@/lib/hooks/files/use-file-upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
};

export function UploadDropzone() {
  const { upload, isUploading, progress, error, reset } = useFileUpload();
  const [overlay, setOverlay] = useState(false);

  const onDrop = useCallback(
    (accepted: File[]): void => {
      setOverlay(false);
      const file = accepted[0];
      if (!file) {
        return;
      }
      upload(file, true);
    },
    [upload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    accept: ACCEPT,
  });

  useEffect(() => {
    function onEnter(event: DragEvent): void {
      if (event.dataTransfer?.types.includes("Files")) {
        setOverlay(true);
      }
    }
    function onLeave(): void {
      setOverlay(false);
    }
    document.addEventListener("dragenter", onEnter);
    document.addEventListener("dragleave", onLeave);
    document.addEventListener("drop", onLeave);
    return () => {
      document.removeEventListener("dragenter", onEnter);
      document.removeEventListener("dragleave", onLeave);
      document.removeEventListener("drop", onLeave);
    };
  }, []);

  return (
    <>
      {overlay ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/80 text-lg font-medium">
          Drop file to upload
        </div>
      ) : null}
      <div
        {...getRootProps()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="w-full max-w-sm space-y-2">
            <p className="text-sm">Uploading… {progress}%</p>
            <Progress value={progress} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the file here"
              : "Drag a file here or click to upload (PDF, DOCX, CSV, TXT, MD, images · 10MB)"}
          </p>
        )}
        {error ? (
          <div className="mt-3 flex flex-col items-center gap-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                reset();
              }}
            >
              Reset
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}
