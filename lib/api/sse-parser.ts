import type { ChatCitation } from "@/lib/api/types";

export type SseEvent = { event: string; data: string };

/**
 * Live `/ai/chat/stream` and `/ai/agent/stream` send `data: {"type":"..."}`
 * frames and omit SSE `event:` lines, so `event` defaults to `"message"`.
 * Discriminate on JSON `type` inside `data`, not on `event`.
 */

export type SseJsonPayload = { type: string; [key: string]: unknown };

export function isChatCitation(value: unknown): value is ChatCitation {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return (
    "note_id" in value &&
    typeof value.note_id === "string" &&
    "chunk_id" in value &&
    typeof value.chunk_id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "relevance_score" in value &&
    typeof value.relevance_score === "number"
  );
}

export function parseCitations(value: unknown): ChatCitation[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isChatCitation);
}

export function readStringField(
  payload: SseJsonPayload,
  key: string,
): string | null {
  const value = payload[key];
  return typeof value === "string" ? value : null;
}

export function parseSseJsonData(data: string): SseJsonPayload | "[DONE]" | null {
  const trimmed = data.trim();
  if (trimmed === "[DONE]") {
    return "[DONE]";
  }
  if (!trimmed.startsWith("{")) {
    return null;
  }
  const parsed: unknown = JSON.parse(trimmed);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("type" in parsed) ||
    typeof (parsed as { type: unknown }).type !== "string"
  ) {
    return null;
  }
  return parsed as SseJsonPayload;
}

function parseSseBlock(block: string): SseEvent | null {
  const trimmed = block.trim();
  if (!trimmed) {
    return null;
  }

  let event = "message";
  const dataLines: string[] = [];

  for (const rawLine of trimmed.split("\n")) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

    if (line.startsWith("event:")) {
      event = line.slice(6).trimStart();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return { event, data: dataLines.join("\n") };
}

export async function* parseSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseEvent> {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const parsed = parseSseBlock(block);
        if (parsed) {
          yield parsed;
        }
      }
    }

    buffer += decoder.decode();
    buffer = buffer.replace(/\r\n/g, "\n");

    if (buffer.length > 0) {
      const blocks = buffer.split("\n\n");
      for (const block of blocks) {
        const parsed = parseSseBlock(block);
        if (parsed) {
          yield parsed;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
