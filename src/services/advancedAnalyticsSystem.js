/**
 * Advanced Analytics System
 * Tracks agent performance metrics, conversation patterns, and engagement
 */
// DB is only available in the browser. Lazy-import it when needed to avoid SSR errors.
let db = null;

async function getDb() {
  if (typeof window === 'undefined') return null;
  if (db) return db;
  const mod = await import('@/storage/db/dexie');
  db = mod.db;
  return db;
}

export class AdvancedAnalyticsSystem {
  constructor() {
    this.metrics = {
      totalMessages: 0,
      totalInteractions: 0,
      startTime: Date.now(),
      agentMetrics: {},
      conversationMetrics: [],
      engagementScore: 0,
      topicFrequency: {},
    };

    this.initializeAgentMetrics();
    // Try to load persisted metrics
    // Attempt to load persisted metrics only on client
    if (typeof window !== 'undefined') {
      this.loadFromDb().catch(() => { });
    }
  }

  /**
   * Initialize metrics for each agent
   */
  initializeAgentMetrics() {
    const agents = ['alex', 'mia', 'noah'];
    agents.forEach((agentId) => {
      this.metrics.agentMetrics[agentId] = {
        messagesCount: 0,
        averageLength: 0,
        participationRate: 0,
        responseAccuracy: 100,
        engagementLevel: 0,
        topicsExpertise: {},
      };
    });
  }

  /**
   * Record message interaction
   */
  recordInteraction(message) {
    this.metrics.totalMessages++;

    const agentId = message.senderId;
    if (this.metrics.agentMetrics[agentId]) {
      const metric = this.metrics.agentMetrics[agentId];
      metric.messagesCount++;
      metric.averageLength = (metric.averageLength + message.text.length) / 2;
    }

    // Update conversation metrics
    this.metrics.conversationMetrics.push({
      timestamp: new Date().toISOString(),
      agentId,
      messageLength: message.text.length,
      type: message.senderType,
    });

    this.updateEngagementScore();

    // persist analytics
    this.saveToDb().catch((e) => console.error('Failed to persist analytics:', e));
  }

  /**
   * Track topic frequency
   */
  recordTopic(topic, agentId) {
    if (!this.metrics.topicFrequency[topic]) {
      this.metrics.topicFrequency[topic] = { count: 0, agents: {} };
    }

    this.metrics.topicFrequency[topic].count++;

    if (!this.metrics.topicFrequency[topic].agents[agentId]) {
      this.metrics.topicFrequency[topic].agents[agentId] = 0;
    }

    this.metrics.topicFrequency[topic].agents[agentId]++;

    // persist analytics
    this.saveToDb().catch((e) => console.error('Failed to persist analytics:', e));
  }

  /**
   * Update engagement score
   */
  updateEngagementScore() {
    const sessionDuration = (Date.now() - this.metrics.startTime) / 1000 / 60; // in minutes
    const messageRate = this.metrics.totalMessages / Math.max(sessionDuration, 1);
    const agentParticipation = this.calculateAgentParticipation();

    // Engagement = message rate * agent diversity
    this.metrics.engagementScore = Math.min(100, (messageRate * agentParticipation) / 10);
  }

  /**
   * Calculate agent participation diversity
   */
  calculateAgentParticipation() {
    const agents = Object.keys(this.metrics.agentMetrics);
    const participationRates = agents.map((agentId) => {
      const count = this.metrics.agentMetrics[agentId].messagesCount;
      return count / Math.max(this.metrics.totalMessages, 1);
    });

    // Calculate diversity (inverse of max participation)
    const maxParticipation = Math.max(...participationRates);
    return Math.max(1, 1 / maxParticipation);
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const sessionDuration = (Date.now() - this.metrics.startTime) / 1000 / 60;

    return {
      session: {
        duration: Math.round(sessionDuration),
        totalMessages: this.metrics.totalMessages,
        avgMessagesPerMinute: (this.metrics.totalMessages / Math.max(sessionDuration, 1)).toFixed(2),
      },
      agents: this.getAgentReport(),
      engagement: {
        score: Math.round(this.metrics.engagementScore),
        topicDiversity: Object.keys(this.metrics.topicFrequency).length,
        mostCommonTopic: this.getMostCommonTopic(),
      },
    };
  }

  /**
   * Get detailed agent report
   */
  getAgentReport() {
    const report = {};
    const totalMessages = this.metrics.totalMessages || 1;

    Object.keys(this.metrics.agentMetrics).forEach((agentId) => {
      const metric = this.metrics.agentMetrics[agentId];
      report[agentId] = {
        messageCount: metric.messagesCount,
        participationRate: ((metric.messagesCount / totalMessages) * 100).toFixed(1) + '%',
        avgMessageLength: Math.round(metric.averageLength),
        engagementLevel: metric.messagesCount > 0 ? 'high' : 'low',
      };
    });

    return report;
  }

  /**
   * Get most common topic
   */
  getMostCommonTopic() {
    let mostCommon = null;
    let maxCount = 0;

    Object.keys(this.metrics.topicFrequency).forEach((topic) => {
      if (this.metrics.topicFrequency[topic].count > maxCount) {
        maxCount = this.metrics.topicFrequency[topic].count;
        mostCommon = topic;
      }
    });

    return mostCommon || 'general';
  }

  /**
   * Get agent expertise areas
   */
  getAgentExpertise(agentId) {
    const topic = this.metrics.topicFrequency;
    const expertise = {};

    Object.keys(topic).forEach((t) => {
      if (topic[t].agents[agentId]) {
        expertise[t] = topic[t].agents[agentId];
      }
    });

    return expertise;
  }

  /**
   * Export analytics
   */
  exportAnalytics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      report: this.getPerformanceReport(),
    };
  }

  /**
   * Reset analytics
   */
  reset() {
    this.metrics = {
      totalMessages: 0,
      totalInteractions: 0,
      startTime: Date.now(),
      agentMetrics: {},
      conversationMetrics: [],
      engagementScore: 0,
      topicFrequency: {},
    };
    this.initializeAgentMetrics();

    // persist cleared state
    this.saveToDb().catch(() => { });
  }

  async saveToDb() {
    try {
      const database = await getDb();
      if (!database) return;

      const payload = {
        id: 'analytics_snapshot',
        data: this.metrics,
        createdAt: Date.now(),
      };

      await database.analytics.put(payload);
    } catch (error) {
      throw error;
    }
  }

  async loadFromDb() {
    try {
      const database = await getDb();
      if (!database) return;

      const row = await database.analytics.get('analytics_snapshot');
      if (row && row.data) {
        this.metrics = row.data;
      }
    } catch (error) {
      // ignore
    }
  }

  /**
   * Get engagement trend
   */
  getEngagementTrend(windowSize = 10) {
    const conversations = this.metrics.conversationMetrics.slice(-windowSize);
    const trend = {
      trend: conversations.length > 0 ? 'stable' : 'none',
      messageCount: conversations.length,
      agentDiversity: this.countUnique(conversations.map((c) => c.agentId)),
    };

    return trend;
  }

  /**
   * Count unique values
   */
  countUnique(array) {
    return new Set(array).size;
  }

  /**
   * Get conversation summary
   */
  getConversationSummary() {
    return {
      totalMessages: this.metrics.totalMessages,
      agentCount: Object.keys(this.metrics.agentMetrics).length,
      topicCount: Object.keys(this.metrics.topicFrequency).length,
      engagementScore: Math.round(this.metrics.engagementScore),
      sessionDuration: Math.round((Date.now() - this.metrics.startTime) / 1000 / 60),
    };
  }
}

export const advancedAnalyticsSystem = new AdvancedAnalyticsSystem();
