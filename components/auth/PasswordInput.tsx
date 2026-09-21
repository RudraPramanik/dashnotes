"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PasswordInput({ className, ...props }: ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? "Hide password" : "Show password";

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn("pr-9", className)}
        type={visible ? "text" : "password"}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground"
        aria-label={toggleLabel}
        aria-pressed={visible}
        onClick={() => {
          setVisible((current) => !current);
        }}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}
