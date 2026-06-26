export default function TypingPlaceholder() {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-3xl border border-border bg-[#111827] px-4 py-3 text-sm text-muted">
      <div className="flex h-3 w-20 items-center justify-between rounded-full bg-slate-900 px-2 py-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
      </div>
      <p>Alex is typing...</p>
    </div>
  );
}
