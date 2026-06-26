import { ChatRepository } from '@/storage/repositories/chat-repository';
import { parseMentions, createMessage } from '@/utils/message';
import { participants } from '@/constants/chatData';

export const ChatService = {
  async loadMessages() {
    return ChatRepository.getAllMessages();
  },

  async saveMessage({ senderId, senderName, senderType, text, replyTo = null, attachments = [], roomId = null }) {
    const message = createMessage({ senderId, senderName, senderType, text, replyTo, attachments });
    message.mentions = parseMentions(text, participants);
    if (roomId) message.roomId = roomId;
    await ChatRepository.addMessage(message);
    return message;
  },

  async updateMessage(messageId, updates) {
    if (updates.text) {
      updates.mentions = parseMentions(updates.text, participants);
    }
    await ChatRepository.updateMessage(messageId, updates);
  },

  async deleteMessage(messageId) {
    await ChatRepository.deleteMessage(messageId);
  },

  async clearMessages() {
    await ChatRepository.clearMessages();
  },

  async seedMessages(messages) {
    await Promise.all(messages.map((message) => ChatRepository.addMessage(message)));
    return messages;
  },
};
