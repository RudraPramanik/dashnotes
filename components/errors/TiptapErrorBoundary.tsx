"use client";

import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

import { Button } from "@/components/ui/button";

function TiptapFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="rounded-md border border-destructive/50 p-4">
      <p className="font-medium">Editor unavailable</p>
      <Button className="mt-3" variant="outline" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

export function TiptapErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary FallbackComponent={TiptapFallback}>{children}</ErrorBoundary>
  );
}
