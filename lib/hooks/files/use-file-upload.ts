"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { FileRecord } from "@/lib/api/types";
import { handleUnauthorized } from "@/lib/auth/token-refresh";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

function getBaseUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("API URL not configured");
  }
  return baseUrl;
}

function isFileRecord(value: unknown): value is FileRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string"
  );
}

function buildForm(
  file: File,
  isPrivate: boolean,
  description?: string,
): FormData {
  const form = new FormData();
  form.append("file", file);
  form.append("is_private", String(isPrivate));
  form.append("description", description ?? "");
  return form;
}

export function useFileUpload(): {
  upload: (file: File, isPrivate: boolean, description?: string) => void;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
} {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback((): void => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const finishSuccess = useCallback(
    (record: FileRecord): void => {
      const workspaceId = useAuthStore.getState().workspaceId;
      if (workspaceId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.files(workspaceId),
        });
      }
      sessionStorage.setItem(
        `dashnotes_index_lag_${record.id}`,
        String(Date.now()),
      );
      toast.success("File uploaded");
      setProgress(100);
      setIsUploading(false);
    },
    [queryClient],
  );

  const upload = useCallback(
    (file: File, isPrivate: boolean, description?: string): void => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      function sendXhr(isRetry: boolean): void {
        const xhr = new XMLHttpRequest();
        xhr.timeout = 20_000;
        xhr.upload.onprogress = (event: ProgressEvent<EventTarget>): void => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = (): void => {
          if (xhr.status === 401 && !isRetry) {
            void handleUnauthorized().then((ok) => {
              if (ok) {
                sendXhr(true);
                return;
              }
              void fallbackFetch();
            });
            return;
          }
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const parsed: unknown = JSON.parse(xhr.responseText);
              if (isFileRecord(parsed)) {
                finishSuccess(parsed);
                return;
              }
            } catch {
              void fallbackFetch();
              return;
            }
          }
          void fallbackFetch();
        };

        xhr.onerror = (): void => {
          void fallbackFetch();
        };
        xhr.ontimeout = (): void => {
          void fallbackFetch();
        };

        xhr.open("POST", `${getBaseUrl()}/files/upload`);
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        }
        xhr.send(buildForm(file, isPrivate, description));
      }

      async function fallbackFetch(): Promise<void> {
        try {
          const record = await apiClient.postForm<FileRecord>(
            "/files/upload",
            buildForm(file, isPrivate, description),
          );
          finishSuccess(record);
        } catch {
          setIsUploading(false);
          setError("Upload failed");
        }
      }

      sendXhr(false);
    },
    [finishSuccess],
  );

  return { upload, isUploading, progress, error, reset };
}
