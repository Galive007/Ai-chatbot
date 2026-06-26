import { nanoid } from 'nanoid';

export const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

export function parseMentions(text, participants) {
  const mentions = new Set();
  const normalized = text.toLowerCase();

  let match;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    const mention = match[1].toLowerCase();
    const participant = participants.find((item) => item.name.toLowerCase() === mention || item.id.toLowerCase() === mention);
    if (participant) {
      mentions.add(participant.id);
    }
  }

  return Array.from(mentions);
}

export function createMessage({ senderId, senderName, senderType, text, replyTo = null, attachments = [] }) {
  return {
    id: nanoid(),
    senderId,
    senderName,
    senderType,
    text,
    attachments,
    mentions: [],
    replyTo,
    reactions: [],
    createdAt: new Date().toISOString(),
    edited: false,
    status: 'sent',
  };
}

export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function formatDateHeader(timestamp) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function isSameDay(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
}

export function groupMessagesByDate(messages) {
  const sorted = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const groups = [];

  for (const message of sorted) {
    const currentDate = formatDateHeader(message.createdAt);
    const existing = groups.find((group) => group.date === currentDate);

    if (existing) {
      existing.messages.push(message);
    } else {
      groups.push({ date: currentDate, messages: [message] });
    }
  }

  return groups;
}
