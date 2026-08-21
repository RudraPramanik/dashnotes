"use client";

type SystemMessageProps = {
  content: string;
};

export function SystemMessage({ content }: SystemMessageProps) {
  return (
    <p className="text-center text-sm italic text-muted-foreground">{content}</p>
  );
}
