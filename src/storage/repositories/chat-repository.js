import { db } from '@/storage/db/dexie';

export const ChatRepository = {
  async getAllMessages() {
    return db.messages.orderBy('createdAt').toArray();
  },

  async addMessage(message) {
    await db.messages.add(message);
    return message;
  },

  async updateMessage(messageId, updates) {
    await db.messages.update(messageId, updates);
  },

  async deleteMessage(messageId) {
    await db.messages.delete(messageId);
  },

  async clearMessages() {
    await db.messages.clear();
  },
};
