export default function ParticipantCard({ participant }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-4 transition hover:border-slate-500">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-primary">
          {participant.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-foreground">{participant.name}</p>
          <p className="text-sm text-muted">{participant.role}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>{participant.status}</span>
        <span className="rounded-full bg-slate-900 px-2 py-1">Active</span>
      </div>
    </div>
  );
}
