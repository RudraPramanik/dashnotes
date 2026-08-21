"use client";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

type NoteTitleFieldProps = {
  initialTitle: string;
  onSave: (title: string) => void;
};

export function NoteTitleField({
  initialTitle,
  onSave,
}: NoteTitleFieldProps) {
  const [title, setTitle] = useState(initialTitle);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const skipFirst = useRef(true);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      onSaveRef.current(title);
    }, 1500);
    return () => {
      window.clearTimeout(handle);
    };
  }, [title]);

  return (
    <Input
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      aria-label="Note title"
    />
  );
}
