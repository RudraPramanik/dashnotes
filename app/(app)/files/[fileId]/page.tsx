"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";

import { downloadFileBlob } from "@/lib/api/files";
import { useFile } from "@/lib/hooks/files/use-file";
import { useShellStore } from "@/lib/stores/shell-store";
import { resolveFileUrl } from "@/lib/utils/file-icons";
import { FileMetaPanel } from "@/components/files/FileMetaPanel";
import { FilePreview } from "@/components/files/FilePreview";
import { ContextPanel } from "@/components/shell/ContextPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FilePage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = use(params);
  const { file, isLoading, isError, pollingExceeded, refetch } = useFile(fileId);
  const openContextPanel = useShellStore((state) => state.openContextPanel);
  const closeContextPanel = useShellStore((state) => state.closeContextPanel);
  const [lagStartedAt, setLagStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    openContextPanel();
    const raw = sessionStorage.getItem(`dashnotes_index_lag_${fileId}`);
    if (raw) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed)) {
        setLagStartedAt(parsed);
      }
    }
    return () => {
      closeContextPanel();
    };
  }, [closeContextPanel, fileId, openContextPanel]);

  useEffect(() => {
    if (lagStartedAt === null) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 5000);
    return () => {
      window.clearInterval(id);
    };
  }, [lagStartedAt]);

  const isLagging = lagStartedAt !== null && now - lagStartedAt < 60_000;

  async function onDownload(): Promise<void> {
    if (!file) {
      return;
    }
    if (file.download_url) {
      window.open(resolveFileUrl(file.download_url), "_blank");
      return;
    }
    const blob = await downloadFileBlob(file.id);
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank");
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !file) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-destructive">File not found</p>
        <Button variant="outline" asChild>
          <Link href="/files">Back to files</Link>
        </Button>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">{file.name}</h1>
          <Button variant="outline" onClick={() => void onDownload()}>
            Download
          </Button>
        </div>
        {isLagging ? (
          <p className="text-sm text-muted-foreground">
            Indexing… Searchable in about a minute. This is not an AI outage.
          </p>
        ) : null}
        {pollingExceeded ? (
          <p className="text-sm text-muted-foreground">
            Still processing — check back later
          </p>
        ) : null}
        <FilePreview file={file} />
      </div>
      <ContextPanel>
        <FileMetaPanel fileId={fileId} />
      </ContextPanel>
    </div>
  );
}
