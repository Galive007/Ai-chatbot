import { FilePlus } from 'lucide-react';

export default function AttachmentButton() {
  return (
    <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-slate-900 px-4 py-2 text-sm text-muted transition hover:border-slate-500">
      <FilePlus className="h-4 w-4" /> Attach
    </button>
  );
}
