"use client";

import { ErrorBoundary, getErrorMessage, type FallbackProps } from "react-error-boundary";

import { Button } from "@/components/ui/button";

function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const rawMessage = getErrorMessage(error) ?? "An unknown error occurred";
  const message =
    rawMessage.length > 200 ? rawMessage.slice(0, 200) : rawMessage;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">{message}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Button variant="outline" onClick={resetErrorBoundary}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
