export default function DateSeparator({ date }) {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted">
      <span className="h-px flex-1 bg-border" />
      <span>{date}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}