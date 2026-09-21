import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-center text-2xl font-semibold">Reset password</h1>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
