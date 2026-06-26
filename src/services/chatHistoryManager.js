/**
 * Chat History Manager
 * Handles saving, loading, and exporting conversation history
 */

import { ChatRepository } from '@/storage/repositories/chat-repository';
import { db } from '@/storage/db/dexie';

export class ChatHistoryManager {
  constructor() {
    this.savedSessions = [];
  }

  /**
   * Save current conversation as a session
   */
  async saveSession(messages, metadata = {}) {
    const session = {
      id: `session_${Date.now()}`,
      messages,
      metadata: {
        savedAt: new Date().toISOString(),
        messageCount: messages.length,
        duration: metadata.duration || 0,
        ...metadata,
      },
      createdAt: new Date().toISOString(),
    };

    // Save to storage
    try {
      await db.sessions.put({ id: session.id, data: session, createdAt: Date.now() });
      this.savedSessions.push(session);
      return session;
    } catch (error) {
      console.error('Failed to save session:', error);
      return null;
    }
  }

  /**
   * Load a saved session
   */
  async loadSession(sessionId) {
    try {
      return this.savedSessions.find((s) => s.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  /**
   * Get all saved sessions
   */
  getAllSessions() {
    return this.savedSessions;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId) {
    try {
      this.savedSessions = this.savedSessions.filter((s) => s.id !== sessionId);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Export messages as JSON
   */
  exportAsJSON(messages) {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages,
      },
      null,
      2
    );
  }

  /**
   * Export messages as CSV
   */
  exportAsCSV(messages) {
    const headers = ['Timestamp', 'Speaker', 'Type', 'Message'];
    const rows = messages.map((m) => [
      new Date(m.createdAt).toISOString(),
      m.senderName,
      m.senderType,
      `"${m.text.replace(/\"/g, '""')}"`,
    ]);

    return (
      headers.join(',') +
      '\n' +
      rows.map((row) => row.join(',')).join('\n')
    );
  }

  /**
   * Export messages as Markdown
   */
  exportAsMarkdown(messages, title = 'Conversation') {
    let md = `# ${title}\n\n`;
    md += `**Exported:** ${new Date().toISOString()}\n`;
    md += `**Message Count:** ${messages.length}\n\n`;

    messages.forEach((m) => {
      const emoji = m.senderType === 'ai' ? '🤖' : '👤';
      const time = new Date(m.createdAt).toLocaleTimeString();
      md += `${emoji} **${m.senderName}** *(${time})*\n`;
      md += `${m.text}\n\n`;
    });

    return md;
  }

  /**
   * Export with custom format
   */
  export(messages, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return this.exportAsJSON(messages);
      case 'csv':
        return this.exportAsCSV(messages);
      case 'markdown':
      case 'md':
        return this.exportAsMarkdown(messages);
      default:
        return this.exportAsJSON(messages);
    }
  }
}

export const chatHistoryManager = new ChatHistoryManager();
