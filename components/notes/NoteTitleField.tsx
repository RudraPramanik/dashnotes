"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

type NoteTitleFieldProps = {
  initialTitle: string;
  onChange: (title: string) => void;
};

export function NoteTitleField({
  initialTitle,
  onChange,
}: NoteTitleFieldProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  return (
    <Input
      value={title}
      onChange={(event) => {
        const next = event.target.value;
        setTitle(next);
        onChange(next);
      }}
      aria-label="Note title"
    />
  );
}
