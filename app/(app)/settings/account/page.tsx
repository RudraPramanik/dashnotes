"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { changePassword, isAuthRequestError } from "@/lib/api/auth";
import { claimsFromAccessToken } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/stores/auth-store";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const changeSchema = z
  .object({
    currentPassword: z.string().min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different",
    path: ["newPassword"],
  });

type ChangeValues = z.infer<typeof changeSchema>;

export default function AccountSettingsPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeValues>({
    resolver: zodResolver(changeSchema),
  });

  function handleSignOut(): void {
    clearSession();
    router.push("/auth/login");
  }

  async function onChangePassword(values: ChangeValues): Promise<void> {
    setFormError(null);
    setFormSuccess(null);
    try {
      const tokens = await changePassword(values.currentPassword, values.newPassword);
      const claims = claimsFromAccessToken(tokens.access_token);
      setSession(
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        claims,
      );
      reset();
      setFormSuccess("Password updated");
    } catch (error) {
      if (isAuthRequestError(error) && (error.status === 401 || error.status === 400)) {
        setFormError(error.message || "Could not update password");
        return;
      }
      setFormError("Connection failed. Check your connection.");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">Signed in as {userId ?? "unknown"}</p>
        <p className="text-sm">Role: {role ?? "unknown"}</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(onChangePassword)(event);
        }}
        noValidate
      >
        <h2 className="text-lg font-medium">Change password</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
          {errors.currentPassword ? (
            <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">Password</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        {formSuccess ? <p className="text-sm text-muted-foreground">{formSuccess}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>

      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
