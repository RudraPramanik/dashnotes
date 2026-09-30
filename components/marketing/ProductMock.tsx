export function ProductMock(): React.ReactElement {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_24px_80px_-32px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-3 text-xs text-muted-foreground">DashNotes</span>
      </div>
      <div className="grid min-h-[280px] grid-cols-[7.5rem_1fr] sm:grid-cols-[9rem_1fr]">
        <aside className="space-y-3 border-r border-border/70 bg-muted/20 p-3 text-[11px] text-muted-foreground sm:p-4 sm:text-xs">
          <p className="font-medium text-foreground">Workspace</p>
          <p className="rounded-md bg-background/80 px-2 py-1.5 text-foreground">
            Notes
          </p>
          <p className="px-2 py-1">Files</p>
          <p className="px-2 py-1">Chat</p>
          <p className="px-2 py-1">Agent</p>
        </aside>
        <div className="space-y-4 p-4 sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Chat</p>
            <p className="text-sm text-foreground">
              What did we decide about Q4 pricing?
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 sm:p-4">
            <p className="text-sm leading-relaxed text-foreground">
              Based on your notes, the team chose a three-tier model with a free
              starter plan…
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                Q4 planning · 0.92
              </span>
              <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                Pricing brief · 0.88
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2.5 text-xs text-muted-foreground">
            <span className="flex-1">Ask about your notes and files…</span>
            <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
              Send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
