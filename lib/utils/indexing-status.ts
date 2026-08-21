import type { IndexingStatus } from "@/lib/api/types";

export type { IndexingStatus };

export type BadgeConfig = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  showSpinner: boolean;
};

const INDEXING_VALUES: ReadonlySet<string> = new Set([
  "pending",
  "processing",
  "indexed",
  "failed",
]);

export function getOptionalIndexingStatus(
  record: object | null | undefined,
): IndexingStatus | null {
  if (record === null || record === undefined) {
    return null;
  }
  if (!("indexing_status" in record)) {
    return null;
  }
  const value = record.indexing_status;
  if (typeof value !== "string" || !INDEXING_VALUES.has(value)) {
    return null;
  }
  if (
    value === "pending" ||
    value === "processing" ||
    value === "indexed" ||
    value === "failed"
  ) {
    return value;
  }
  return null;
}

export function getIndexingDisplay(
  status: IndexingStatus | undefined | null,
): BadgeConfig {
  if (status === "pending") {
    return { label: "Pending", variant: "secondary", showSpinner: false };
  }
  if (status === "processing") {
    return { label: "Indexing…", variant: "secondary", showSpinner: true };
  }
  if (status === "indexed") {
    return { label: "Indexed", variant: "default", showSpinner: false };
  }
  if (status === "failed") {
    return { label: "Index failed", variant: "destructive", showSpinner: false };
  }
  return { label: "Indexing…", variant: "secondary", showSpinner: true };
}

export function shouldPoll(
  status: IndexingStatus | undefined | null,
): boolean {
  return status === "pending" || status === "processing";
}
