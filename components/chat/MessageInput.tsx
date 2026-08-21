"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type MessageInputProps = {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onCancel: () => void;
  placeholder?: string;
  submitLabel?: string;
};

export function MessageInput({
  onSend,
  isStreaming,
  onCancel,
  placeholder = "Ask about your notes and files…",
  submitLabel = "Send",
}: MessageInputProps) {
  const [value, setValue] = useState("");

  function submit(): void {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="sticky bottom-0 mx-auto w-full max-w-[42rem] bg-background px-4 pb-4">
      <div className="flex items-end gap-2 rounded-2xl border bg-card p-2">
        <textarea
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          rows={1}
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        {isStreaming ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            disabled={value.trim().length === 0}
            onClick={submit}
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
