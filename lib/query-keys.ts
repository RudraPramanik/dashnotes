export const queryKeys = {
  notes: (wid: string) => ["notes", wid] as const,
  note: (wid: string, id: string) => ["notes", wid, id] as const,
  files: (wid: string) => ["files", wid] as const,
  file: (wid: string, id: string) => ["files", wid, id] as const,
  notebooks: (wid: string) => ["notebooks", wid] as const,
  threads: (wid: string) => ["ai", "threads", wid] as const,
  threadMessages: (wid: string, tid: string) =>
    ["ai", "threads", wid, tid, "messages"] as const,
  workspaces: () => ["workspaces"] as const,
  workspaceMe: () => ["workspaces", "me"] as const,
  members: (wid: string) => ["members", wid] as const,
  aiHealth: () => ["ai", "health"] as const,
  automationCount: (wid: string) =>
    ["automation", "pending-count", wid] as const,
};
