"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isAuthRequestError, register as registerAccount } from "@/lib/api/auth";
import { claimsFromAccessToken, setPresenceCookie } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) {
      return;
    }

    const id = window.setInterval(() => {
      setRetryAfter((current) => {
        if (current === null || current <= 1) {
          return null;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [retryAfter]);

  async function onSubmit(values: RegisterValues): Promise<void> {
    setFormError(null);
    setRetryAfter(null);

    try {
      const tokens = await registerAccount(
        values.email,
        values.password,
        values.workspaceName,
      );
      const claims = claimsFromAccessToken(tokens.access_token);
      setSession(
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        claims,
      );
      setPresenceCookie();
      router.push("/notes");
    } catch (error) {
      if (isAuthRequestError(error) && error.status === 429) {
        const seconds = error.retryAfter ?? 60;
        setRetryAfter(seconds);
        setFormError(`Too many requests. Try again in ${seconds}s`);
        return;
      }

      if (isAuthRequestError(error) && error.status >= 400 && error.status < 500) {
        setFormError(error.message || "Could not create account");
        return;
      }

      setFormError("Connection failed. Check your connection.");
    }
  }

  const retryMessage =
    retryAfter !== null && retryAfter > 0
      ? `Too many requests. Try again in ${retryAfter}s`
      : formError;

  return (
    <form
      className="flex flex-col gap-4"
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="workspaceName">Workspace name</Label>
        <Input
          id="workspaceName"
          type="text"
          placeholder="Your company or team name"
          {...register("workspaceName")}
        />
        {errors.workspaceName ? (
          <p className="text-sm text-destructive">
            {errors.workspaceName.message}
          </p>
        ) : null}
      </div>
      {retryMessage ? (
        <p className="text-sm text-destructive">{retryMessage}</p>
      ) : null}
      <Button type="submit" disabled={isSubmitting || retryAfter !== null}>
        {isSubmitting ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="text-foreground underline-offset-4 hover:underline" href="/auth/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
