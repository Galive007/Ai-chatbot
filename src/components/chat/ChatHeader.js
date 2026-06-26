import { Search, Settings2, Trash2 } from 'lucide-react';
import { participants } from '@/constants/chatData';
import { useChatStore } from '@/store/chatStore';

export default function ChatHeader() {
  const clearInbox = useChatStore((state) => state.clearInbox);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Group Chat</p>
        <h1 className="text-3xl font-semibold text-foreground">Study Room</h1>
        <p className="mt-1 text-sm text-muted">A private learning space with AI study partners.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm text-muted transition hover:border-slate-500">
          <Search className="h-4 w-4" /> Search
        </button>
        <button className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm text-muted transition hover:border-slate-500">
          <Settings2 className="h-4 w-4" /> Settings
        </button>
        <button
          type="button"
          onClick={clearInbox}
          className="inline-flex items-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger transition hover:bg-danger/20"
        >
          <Trash2 className="h-4 w-4" /> Clear Chat
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm text-muted">
        <span className="rounded-full bg-slate-800 px-3 py-2">{participants.length} members</span>
        <span className="rounded-full bg-slate-800 px-3 py-2">Drafts off</span>
      </div>
    </div>
  );
}
