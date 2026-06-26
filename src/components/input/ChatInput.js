'use client';

import AttachmentButton from '@/components/input/AttachmentButton';
import { useChatStore } from '@/store/chatStore';

const reactionOptions = ['👍', '❤️', '😂', '🔥', '😮', '😢'];

export default function ChatInput() {
  const { draft, setDraft, sendMessage, replyTo, cancelEdit, editingMessageId } = useChatStore();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        sendMessage(draft);
      }}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-background px-4 py-3 shadow-sm sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3">
        <AttachmentButton />
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          type="text"
          placeholder="Write a message..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          aria-label="Write a message"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {editingMessageId ? (
          <button
            type="button"
            onClick={cancelEdit}
            className="rounded-2xl border border-border bg-slate-900 px-4 py-2 text-sm text-muted transition hover:border-slate-500"
          >
            Cancel
          </button>
        ) : null}
        {reactionOptions.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => sendMessage(`${draft} ${emoji}`)}
            className="rounded-2xl border border-border bg-slate-900 px-3 py-2 text-sm transition hover:border-slate-500"
          >
            {emoji}
          </button>
        ))}
        <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
          {editingMessageId ? 'Save' : 'Send'}
        </button>
      </div>
      {replyTo ? (
        <div className="rounded-3xl border border-border bg-slate-900 px-4 py-3 text-sm text-slate-300">
          <span className="font-semibold text-foreground">Replying to {replyTo.senderName}:</span>
          <p className="mt-1 text-slate-400">{replyTo.text}</p>
        </div>
      ) : null}
    </form>
  );
}
