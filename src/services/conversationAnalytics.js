/**
 * Conversation Analytics
 * Tracks and analyzes conversation patterns, engagement, and insights
 */

export class ConversationAnalytics {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
  }

  /**
   * Start a new conversation session
   */
  startSession() {
    this.currentSession = {
      startTime: Date.now(),
      messageCount: 0,
      agentParticipation: {},
      topics: [],
      engagement: 0,
    };
  }

  /**
   * Record a message in the session
   */
  recordMessage(message) {
    if (!this.currentSession) {
      this.startSession();
    }

    this.currentSession.messageCount++;

    if (message.senderType === 'ai') {
      const agentId = message.senderId;
      this.currentSession.agentParticipation[agentId] =
        (this.currentSession.agentParticipation[agentId] || 0) + 1;
    }

    this.calculateEngagement();
  }

  /**
   * Calculate conversation engagement level
   */
  calculateEngagement() {
    if (!this.currentSession) return 0;

    const { messageCount, agentParticipation } = this.currentSession;
    const participatingAgents = Object.keys(agentParticipation).length;

    // Engagement score: balance of message count and agent diversity
    const messageScore = Math.min(messageCount / 20, 1); // Max at 20 messages
    const diversityScore = (participatingAgents / 3) * 100; // 3 agents max

    this.currentSession.engagement = (messageScore * 50 + diversityScore * 50) / 100;

    return this.currentSession.engagement;
  }

  /**
   * Get conversation insights
   */
  getInsights(messages) {
    if (!this.currentSession) {
      return null;
    }

    const { messageCount, agentParticipation, startTime } = this.currentSession;
    const duration = (Date.now() - startTime) / 1000; // in seconds

    const agentStats = Object.entries(agentParticipation).map(([agentId, count]) => ({
      agentId,
      messageCount: count,
      percentage: (count / messageCount) * 100,
    }));

    const totalWords = messages.reduce((sum, m) => sum + (m.text?.split(' ').length || 0), 0);
    const avgWordLength = totalWords / messageCount;

    return {
      totalMessages: messageCount,
      duration,
      avgMessageLength: avgWordLength,
      agentParticipation: agentStats,
      engagement: this.currentSession.engagement,
      mostActive: agentStats.sort((a, b) => b.messageCount - a.messageCount)[0],
    };
  }

  /**
   * End session and save analytics
   */
  endSession() {
    if (this.currentSession) {
      this.sessions.push({
        ...this.currentSession,
        endTime: Date.now(),
      });
    }
    this.currentSession = null;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      totalSessions: this.sessions.length,
      totalMessages: this.sessions.reduce((sum, s) => sum + s.messageCount, 0),
      avgEngagement:
        this.sessions.reduce((sum, s) => sum + s.engagement, 0) / this.sessions.length || 0,
    };
  }
}

export const conversationAnalytics = new ConversationAnalytics();
