"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isAuthRequestError, requestPasswordReset } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(values: ForgotValues): Promise<void> {
    setFormError(null);
    setFormSuccess(null);
    try {
      const result = await requestPasswordReset(values.email);
      setFormSuccess(result.message);
    } catch (error) {
      if (isAuthRequestError(error) && error.status === 429) {
        setFormError("Too many requests. Try again later.");
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      {formSuccess ? <p className="text-sm text-muted-foreground">{formSuccess}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link className="text-foreground underline-offset-4 hover:underline" href="/auth/login">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
