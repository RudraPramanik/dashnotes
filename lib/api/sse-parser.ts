export type SseEvent = { event: string; data: string };

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
