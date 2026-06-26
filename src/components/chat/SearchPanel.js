'use client';

import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useChatStore } from '@/store/chatStore';
import { formatTime } from '@/utils/message';

export default function SearchPanel({ open, onClose }) {
  const [query, setQuery] = useState('');
  const messages = useChatStore((state) => state.messages);

  const filteredResults = useMemo(() => {
    const all = messages.map((m) => ({
      id: m.id,
      title: m.senderName,
      snippet: m.text.length > 120 ? m.text.slice(0, 120) + '...' : m.text,
      timestamp: formatTime(m.createdAt),
      raw: m,
    }));

    if (!query.trim()) return all.reverse();

    return all
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.snippet.toLowerCase().includes(query.toLowerCase()))
      .reverse();
  }, [messages, query]);

  return (
    <Modal title="Search Messages" open={open} onClose={onClose}>
      <div className="space-y-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-border bg-slate-950 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted"
          placeholder="Search conversation..."
        />
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div key={result.id} className="rounded-3xl border border-border bg-[#111827] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-foreground">{result.title}</h3>
                <span className="text-xs uppercase tracking-[0.24em] text-muted">{result.timestamp}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{result.snippet}</p>
            </div>
          ))}
          {filteredResults.length === 0 ? (
            <p className="rounded-3xl border border-border bg-background p-4 text-sm text-muted">No matches found.</p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
