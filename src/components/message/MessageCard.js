import { ArrowUpRight, MessageCircle } from 'lucide-react';
import MessageText from '@/components/message/MessageText';
import { formatTime } from '@/utils/message';

function getBubbleStyles(type) {
  if (type === 'user') {
    return 'rounded-[32px] rounded-br-2xl bg-primary text-white';
  }

  return 'rounded-[32px] rounded-bl-2xl bg-slate-800 text-slate-100';
}

export default function MessageCard({ message, onReply, onEdit, onDelete, onReact }) {
  return (
    <div className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <span className="font-semibold text-foreground">{message.senderName}</span>
          <span>{formatTime(message.createdAt)}</span>
          {message.edited ? <span className="text-slate-400">(edited)</span> : null}
        </div>

        {message.replyTo ? (
          <div className="mb-3 rounded-3xl border border-border bg-[#111827] px-4 py-3 text-sm text-slate-300">
            <p className="font-semibold text-slate-200">{message.replyTo.senderName}</p>
            <p>{message.replyTo.text}</p>
          </div>
        ) : null}

        <div className={`${getBubbleStyles(message.senderType)} px-4 py-3`}>
          <MessageText text={message.text} />
        </div>

        {message.attachments ? (
          <div className="mt-3 grid gap-3">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-3 rounded-3xl border border-border bg-background p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-slate-200">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{attachment.name}</p>
                  <p className="text-sm text-muted">{attachment.size}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          {message.reactions ? (
            <div className="flex flex-wrap gap-2">
              {message.reactions.map((reaction) => (
                <span key={reaction.emoji} className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1">
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </span>
              ))}
            </div>
          ) : null}

          <button type="button" onClick={onReply} className="rounded-2xl border border-border bg-slate-900 px-3 py-1 text-xs text-muted transition hover:border-slate-500">
            Reply
          </button>
          {message.senderType === 'user' ? (
            <>
              <button type="button" onClick={onEdit} className="rounded-2xl border border-border bg-slate-900 px-3 py-1 text-xs text-muted transition hover:border-slate-500">
                Edit
              </button>
              <button type="button" onClick={onDelete} className="rounded-2xl border border-border bg-slate-900 px-3 py-1 text-xs text-muted transition hover:border-slate-500">
                Delete
              </button>
            </>
          ) : null}
          <button type="button" onClick={onReact} className="rounded-2xl border border-border bg-slate-900 px-3 py-1 text-xs text-muted transition hover:border-slate-500">
            React
          </button>
        </div>
      </div>
    </div>
  );
}
