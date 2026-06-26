'use client';

import MessageCard from '@/components/message/MessageCard';
import DateSeparator from '@/components/message/DateSeparator';
import { groupMessagesByDate } from '@/utils/message';
import { useChatStore } from '@/store/chatStore';

export function MessageList() {
  const { messages, deleteMessage, setReplyTo, startEdit, toggleReaction } = useChatStore();
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex min-h-full flex-col gap-6 pr-2">
      {groupedMessages.map((group) => (
        <div key={group.date} className="space-y-4">
          <DateSeparator date={group.date} />
          {group.messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onReply={() => setReplyTo(message)}
              onEdit={() => startEdit(message)}
              onDelete={() => deleteMessage(message.id)}
              onReact={() => toggleReaction(message.id, '👍')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
