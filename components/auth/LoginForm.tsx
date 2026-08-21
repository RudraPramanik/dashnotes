"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isAuthRequestError, login } from "@/lib/api/auth";
import { claimsFromAccessToken, setPresenceCookie } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
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

  async function onSubmit(values: LoginValues): Promise<void> {
    setFormError(null);
    setRetryAfter(null);

    try {
      const tokens = await login(values.email, values.password);
      const claims = claimsFromAccessToken(tokens.access_token);
      setSession(
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        claims,
      );
      setPresenceCookie();
      document.cookie = "dashnotes_authed=1; path=/";
      router.push("/notes");
    } catch (error) {
      if (isAuthRequestError(error) && error.status === 429) {
        const seconds = error.retryAfter ?? 60;
        setRetryAfter(seconds);
        setFormError(`Too many requests. Try again in ${seconds}s`);
        return;
      }

      if (isAuthRequestError(error) && (error.status === 401 || error.status === 400)) {
        setFormError("Invalid email or password");
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
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      {retryMessage ? (
        <p className="text-sm text-destructive">{retryMessage}</p>
      ) : null}
      <Button type="submit" disabled={isSubmitting || retryAfter !== null}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link className="text-foreground underline-offset-4 hover:underline" href="/auth/register">
          Register
        </Link>
      </p>
    </form>
  );
}
