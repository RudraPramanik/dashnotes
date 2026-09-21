"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isAuthRequestError, resetPassword } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const clearSession = useAuthStore((state) => state.clearSession);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(values: ResetValues): Promise<void> {
    setFormError(null);
    if (!token) {
      setFormError("This reset link is missing a token.");
      return;
    }
    try {
      await resetPassword(token, values.password);
      clearSession();
      router.push("/auth/login");
    } catch (error) {
      if (isAuthRequestError(error) && error.status >= 400 && error.status < 500) {
        setFormError(error.message || "This reset link is invalid or expired.");
        return;
      }
      setFormError("Connection failed. Check your connection.");
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      noValidate
    >
      {!token ? (
        <p className="text-sm text-destructive">This reset link is missing a token.</p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
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
      <Button type="submit" disabled={isSubmitting || !token}>
        {isSubmitting ? "Saving…" : "Set new password"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link className="text-foreground underline-offset-4 hover:underline" href="/auth/login">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
