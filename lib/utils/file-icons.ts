export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "🖼";
  }
  if (mimeType === "application/pdf") {
    return "📄";
  }
  if (mimeType.includes("csv") || mimeType === "text/csv") {
    return "📊";
  }
  if (
    mimeType.includes("word") ||
    mimeType === "application/msword" ||
    mimeType.includes("document")
  ) {
    return "📝";
  }
  if (mimeType.startsWith("text/")) {
    return "📝";
  }
  return "📦";
}

export function getFileTypeLabel(mimeType: string): string {
  if (mimeType === "application/pdf") {
    return "PDF";
  }
  if (mimeType.includes("csv") || mimeType === "text/csv") {
    return "CSV";
  }
  if (mimeType.includes("word") || mimeType.includes("document")) {
    return "Word";
  }
  if (mimeType.startsWith("text/")) {
    return "Text";
  }
  if (mimeType.startsWith("image/")) {
    return "Image";
  }
  return "File";
}

export function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }
  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function resolveFileUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  if (url.startsWith("/")) {
    return `${base}${url}`;
  }
  return `${base}/${url}`;
}
