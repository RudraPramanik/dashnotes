"use client";

import type { PendingApproval } from "@/lib/hooks/ai/use-agent-stream";
import { Button } from "@/components/ui/button";

type ApprovalCardProps = {
  pending: PendingApproval;
  isResolving: boolean;
  onApprove: () => void;
  onReject: () => void;
};

function titleFromArgs(args: Record<string, unknown>): string {
  const title = args.title;
  return typeof title === "string" && title.length > 0 ? title : "Untitled note";
}

function contentPreview(args: Record<string, unknown>): string {
  const content = args.content;
  if (typeof content !== "string" || content.length === 0) {
    return "";
  }
  return content.length > 280 ? `${content.slice(0, 280)}…` : content;
}

export function ApprovalCard({
  pending,
  isResolving,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const action =
    pending.tool === "update_note" ? "Update note" : "Create note";
  const preview = contentPreview(pending.args);

  return (
    <div className="mx-auto mb-3 max-w-2xl rounded-md border p-4 text-sm">
      <p className="font-medium">{action}</p>
      <p className="mt-1">{titleFromArgs(pending.args)}</p>
      {preview ? (
        <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{preview}</p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isResolving}
          onClick={onApprove}
        >
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isResolving}
          onClick={onReject}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
