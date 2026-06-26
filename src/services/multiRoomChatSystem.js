/**
 * Multi-Room Chat System
 * Enables multiple simultaneous conversations with different agent groups
 */
import { db } from '@/storage/db/dexie';

export class MultiRoomChatSystem {
  constructor() {
    this.rooms = new Map();
    this.currentRoomId = null;
    // Load persisted rooms (non-blocking)
    this.loadFromDb().catch(() => { });
  }

  /**
   * Create a new chat room
   */
  createRoom(name, config = {}) {
    const roomId = `room_${Date.now()}`;

    const room = {
      id: roomId,
      name,
      createdAt: new Date().toISOString(),
      messages: [],
      participants: config.participants || ['alex', 'mia', 'noah', 'zoe', 'kai', 'jade', 'leo', 'nia', 'sam'],
      settings: {
        maxMessages: config.maxMessages || 1000,
        autoArchive: config.autoArchive || true,
        archiveAfter: config.archiveAfter || 24 * 60 * 60 * 1000, // 24 hours
        ...config,
      },
      metadata: {
        messageCount: 0,
        lastActivity: new Date().toISOString(),
        archived: false,
      },
    };

    this.rooms.set(roomId, room);
    // persist
    this.saveRoomsToDb().catch((e) => console.error('Failed to persist rooms:', e));
    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get all rooms
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  /**
   * Switch to a different room
   */
  switchRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      return false;
    }

    this.currentRoomId = roomId;
    return true;
  }

  /**
   * Get current room
   */
  getCurrentRoom() {
    if (!this.currentRoomId) return null;
    return this.rooms.get(this.currentRoomId);
  }

  /**
   * Add message to room
   */
  addMessageToRoom(roomId, message) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.messages.push({
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random()}`,
      createdAt: message.createdAt || new Date().toISOString(),
    });

    room.metadata.messageCount++;
    room.metadata.lastActivity = new Date().toISOString();

    // Auto-archive if exceeded max messages
    if (room.metadata.messageCount > room.settings.maxMessages) {
      this.archiveOldestMessages(roomId);
    }

    // persist room update
    this.saveRoomsToDb().catch(() => { });

    return true;
  }

  /**
   * Add message to current room
   */
  addMessage(message) {
    if (!this.currentRoomId) return false;
    return this.addMessageToRoom(this.currentRoomId, message);
  }

  /**
   * Get messages from room
   */
  getMessagesFromRoom(roomId, limit = 50) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.messages.slice(-limit);
  }

  /**
   * Get messages from current room
   */
  getMessages(limit = 50) {
    if (!this.currentRoomId) return [];
    return this.getMessagesFromRoom(this.currentRoomId, limit);
  }

  /**
   * Archive old messages in room
   */
  archiveOldestMessages(roomId, count = 100) {
    const room = this.rooms.get(roomId);
    if (!room || room.messages.length <= count) return [];

    const archived = room.messages.splice(0, count);
    return archived;
  }

  /**
   * Delete room
   */
  deleteRoom(roomId) {
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
    const result = this.rooms.delete(roomId);
    this.saveRoomsToDb().catch(() => { });
    return result;
  }

  /**
   * Clear all messages in room
   */
  clearRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.messages = [];
    room.metadata.messageCount = 0;
    this.saveRoomsToDb().catch(() => { });
    return true;
  }

  /**
   * Search messages across all rooms
   */
  searchMessages(query) {
    const results = [];
    const regex = new RegExp(query, 'i');

    this.rooms.forEach((room) => {
      room.messages.forEach((message) => {
        if (regex.test(message.text)) {
          results.push({
            roomId: room.id,
            roomName: room.name,
            message,
          });
        }
      });
    });

    return results;
  }

  /**
   * Export room
   */
  exportRoom(roomId, format = 'json') {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      room: {
        id: room.id,
        name: room.name,
        createdAt: room.createdAt,
        messageCount: room.metadata.messageCount,
      },
      messages: room.messages,
      exportedAt: new Date().toISOString(),
      format,
    };
  }

  /**
   * Get room statistics
   */
  getRoomStats(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const agentMessages = {};
    room.participants.forEach((agent) => {
      agentMessages[agent] = room.messages.filter((m) => m.senderId === agent).length;
    });

    return {
      roomId: room.id,
      roomName: room.name,
      totalMessages: room.metadata.messageCount,
      agentMessages,
      createdAt: room.createdAt,
      lastActivity: room.metadata.lastActivity,
    };
  }

  /**
   * Get all room statistics
   */
  getAllRoomStats() {
    return Array.from(this.rooms.keys()).map((roomId) => this.getRoomStats(roomId));
  }

  /**
   * Update room settings
   */
  updateRoomSettings(roomId, settings) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.settings = { ...room.settings, ...settings };
    this.saveRoomsToDb().catch(() => { });
    return true;
  }

  /**
   * Add participant to room
   */
  addParticipant(roomId, agentId) {
    const room = this.rooms.get(roomId);
    if (!room || room.participants.includes(agentId)) return false;

    room.participants.push(agentId);
    this.saveRoomsToDb().catch(() => { });
    return true;
  }

  /**
   * Remove participant from room
   */
  removeParticipant(roomId, agentId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.participants = room.participants.filter((p) => p !== agentId);
    this.saveRoomsToDb().catch(() => { });
    return true;
  }

  async saveRoomsToDb() {
    try {
      const payload = {
        id: 'rooms_snapshot',
        data: Array.from(this.rooms.values()),
        createdAt: Date.now(),
      };

      await db.sessions.put(payload);
    } catch (error) {
      throw error;
    }
  }

  async loadFromDb() {
    try {
      const row = await db.sessions.get('rooms_snapshot');
      if (row && row.data) {
        row.data.forEach((r) => this.rooms.set(r.id, r));
        // set currentRoomId to first room if not set
        if (!this.currentRoomId && row.data.length > 0) {
          this.currentRoomId = row.data[0].id;
        }
      }
    } catch (error) {
      // ignore
    }
  }

  /**
   * Clone a room
   */
  cloneRoom(roomId, newName) {
    const originalRoom = this.rooms.get(roomId);
    if (!originalRoom) return null;

    const clonedRoom = this.createRoom(newName, {
      participants: [...originalRoom.participants],
      ...originalRoom.settings,
    });

    clonedRoom.messages = JSON.parse(JSON.stringify(originalRoom.messages));

    return clonedRoom;
  }
}

export const multiRoomChatSystem = new MultiRoomChatSystem();
