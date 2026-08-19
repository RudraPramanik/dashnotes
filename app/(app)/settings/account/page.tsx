"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";

export default function AccountSettingsPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const clearSession = useAuthStore((state) => state.clearSession);

  function handleSignOut(): void {
    clearSession();
    router.push("/auth/login");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="text-sm text-muted-foreground">Signed in as {userId}</p>
      <p className="text-sm">Role: {role ?? "unknown"}</p>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
