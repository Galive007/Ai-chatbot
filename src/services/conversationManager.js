/**
 * Conversation Manager
 * Manages conversation sessions, history, context, and metadata
 */

import { ChatRepository } from '@/storage/repositories/chat-repository';
import { memoryEngine } from '@/services/memoryEngine';
import { advancedAnalyticsSystem } from '@/services/advancedAnalyticsSystem';

export class ConversationManager {
  constructor() {
    this.currentSession = null;
    this.sessionHistory = [];
    this.conversationContext = [];
    this.maxContextMessages = 20;
  }

  /**
   * Start a new conversation session
   */
  startSession(sessionId = null) {
    this.currentSession = {
      id: sessionId || `session_${Date.now()}`,
      startTime: Date.now(),
      messages: [],
      summary: '',
      topics: [],
      participants: new Set(),
      metadata: {
        messageCount: 0,
        agentResponses: {},
        userMessages: 0,
        duration: 0,
      },
    };

    this.sessionHistory.push(this.currentSession);
    return this.currentSession;
  }

  /**
   * Add message to current session
   */
  addMessageToSession(message) {
    if (!this.currentSession) {
      this.startSession();
    }

    this.currentSession.messages.push({
      ...message,
      addedAt: Date.now(),
    });

    this.updateMetadata(message);
    this.updateContext(message);

    // Update analytics system
    try {
      advancedAnalyticsSystem.recordInteraction(message);
      // Record topic frequency if we can infer topics
      const topics = this.extractTopicsFromText(message.text || '');
      topics.forEach((t) => advancedAnalyticsSystem.recordTopic(t, message.senderId));
    } catch (e) {
      // ignore analytics errors
    }
  }

  /**
   * Update session metadata
   */
  updateMetadata(message) {
    if (!this.currentSession) return;

    const { metadata, participants } = this.currentSession;

    metadata.messageCount++;
    participants.add(message.senderId);

    if (message.senderType === 'user') {
      metadata.userMessages++;
    } else if (message.senderType === 'ai') {
      metadata.agentResponses[message.senderId] =
        (metadata.agentResponses[message.senderId] || 0) + 1;
    }

    metadata.duration = Date.now() - this.currentSession.startTime;
  }

  /**
   * Update conversation context (sliding window of recent messages)
   */
  updateContext(message) {
    this.conversationContext.push(message);

    if (this.conversationContext.length > this.maxContextMessages) {
      this.conversationContext.shift();
    }
  }

  /**
   * Get current conversation context
   */
  getContext() {
    return this.conversationContext;
  }

  /**
   * Get last N messages from context
   */
  getRecentMessages(count = 5) {
    return this.conversationContext.slice(-count);
  }

  /**
   * Generate session summary
   */
  async generateSessionSummary() {
    if (!this.currentSession) return null;

    const messages = this.currentSession.messages;
    const summary = {
      totalMessages: messages.length,
      duration: this.currentSession.metadata.duration,
      participants: Array.from(this.currentSession.participants),
      mainTopic: this.extractMainTopic(),
      keyPoints: this.extractKeyPoints(messages),
      agentActivity: this.currentSession.metadata.agentResponses,
      userActivity: this.currentSession.metadata.userMessages,
    };

    return summary;
  }

  /**
   * Extract main topic from session
   */
  extractMainTopic() {
    if (!this.currentSession || this.currentSession.messages.length === 0) {
      return 'General Discussion';
    }

    const topicCounts = {};
    this.currentSession.messages.forEach((msg) => {
      const topics = this.extractTopicsFromText(msg.text);
      topics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    const mainTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];
    return mainTopic ? mainTopic[0] : 'General Discussion';
  }

  /**
   * Extract topics from text
   */
  extractTopicsFromText(text) {
    const topicKeywords = {
      physics: ['physics', 'force', 'motion', 'velocity', 'acceleration', 'newton'],
      math: ['math', 'calculus', 'derivative', 'integral', 'equation', 'function'],
      chemistry: ['chemistry', 'element', 'reaction', 'molecule', 'atom'],
      biology: ['biology', 'cell', 'organism', 'evolution', 'genetics'],
      astronomy: ['astronomy', 'star', 'planet', 'galaxy', 'universe', 'space'],
    };

    const topics = [];
    const lowerText = text.toLowerCase();

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  /**
   * Extract key discussion points
   */
  extractKeyPoints(messages, count = 3) {
    const longestMessages = messages
      .filter((m) => m.text && m.text.length > 50)
      .sort((a, b) => b.text.length - a.text.length)
      .slice(0, count);

    return longestMessages.map((m) => ({
      speaker: m.senderName,
      excerpt: m.text.substring(0, 100) + '...',
      timestamp: m.createdAt,
    }));
  }

  /**
   * End current session
   */
  endSession() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.summary = this.currentSession.metadata;
    }
    return this.currentSession;
  }

  /**
   * Get session history
   */
  getSessionHistory() {
    return this.sessionHistory;
  }

  /**
   * Clear conversation context
   */
  clearContext() {
    this.conversationContext = [];
  }

  /**
   * Export conversation
   */
  async exportConversation(format = 'json') {
    if (!this.currentSession) return null;

    const export_data = {
      session: {
        id: this.currentSession.id,
        startTime: new Date(this.currentSession.startTime).toISOString(),
        endTime: this.currentSession.endTime
          ? new Date(this.currentSession.endTime).toISOString()
          : null,
        duration: this.currentSession.metadata.duration,
      },
      messages: this.currentSession.messages,
      summary: await this.generateSessionSummary(),
    };

    if (format === 'json') {
      return JSON.stringify(export_data, null, 2);
    }

    if (format === 'markdown') {
      return this.formatAsMarkdown(export_data);
    }

    return export_data;
  }

  /**
   * Format conversation as Markdown
   */
  formatAsMarkdown(data) {
    let md = `# Conversation Export\n\n`;
    md += `**Date**: ${data.session.startTime}\n`;
    md += `**Duration**: ${Math.round(data.session.duration / 1000)}s\n\n`;

    md += `## Messages\n\n`;
    data.messages.forEach((msg) => {
      const speaker = msg.senderName;
      const type = msg.senderType === 'ai' ? '🤖' : '👤';
      md += `${type} **${speaker}**: ${msg.text}\n\n`;
    });

    if (data.summary) {
      md += `## Summary\n\n`;
      md += `- **Main Topic**: ${data.summary.mainTopic}\n`;
      md += `- **Total Messages**: ${data.summary.totalMessages}\n`;
      md += `- **Participants**: ${data.summary.participants.join(', ')}\n`;
    }

    return md;
  }
}

export const conversationManager = new ConversationManager();
