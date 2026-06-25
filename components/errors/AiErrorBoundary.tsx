"use client";

import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

import { Button } from "@/components/ui/button";

function AiErrorFallback({
  resetErrorBoundary,
  onReset,
}: FallbackProps & { onReset?: () => void }) {
  function handleTryAgain() {
    resetErrorBoundary();
    onReset?.();
  }

  return (
    <div className="rounded-md border border-destructive/50 p-4">
      <p className="font-medium">AI features unavailable</p>
      <p className="text-sm text-muted-foreground">
        Notes and files are unaffected.
      </p>
      <Button className="mt-3" variant="outline" onClick={handleTryAgain}>
        Try again
      </Button>
    </div>
  );
}

export function AiErrorBoundary({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <AiErrorFallback {...props} onReset={onReset} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
