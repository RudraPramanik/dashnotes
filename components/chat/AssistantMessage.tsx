"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AssistantMessageProps = {
  content: string;
  isStreaming?: boolean;
};

export function AssistantMessage({
  content,
  isStreaming = false,
}: AssistantMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="prose prose-sm dark:prose-invert max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2 text-sm leading-relaxed">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        {isStreaming ? <span className="ml-0.5">▌</span> : null}
      </div>
    </div>
  );
}
