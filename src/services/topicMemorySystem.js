/**
 * Topic Memory System
 * Tracks topics discussed, agent expertise growth, and context per topic
 */

export class TopicMemorySystem {
  constructor() {
    this.topics = {};
    this.agentTopicExpertise = {};
  }

  /**
   * Record topic discussion
   */
  recordTopicDiscussion(topic, agentId, content, sentiment = 'neutral') {
    // Initialize topic if not exists
    if (!this.topics[topic]) {
      this.topics[topic] = {
        name: topic,
        firstMentioned: Date.now(),
        lastMentioned: Date.now(),
        mentions: 0,
        discussions: [],
        relatedTopics: new Set(),
        agents: new Set(),
      };
    }

    const topicData = this.topics[topic];
    topicData.mentions++;
    topicData.lastMentioned = Date.now();
    topicData.agents.add(agentId);

    topicData.discussions.push({
      agentId,
      content,
      sentiment,
      timestamp: Date.now(),
    });

    // Keep last 20 discussions
    if (topicData.discussions.length > 20) {
      topicData.discussions.shift();
    }

    // Update agent expertise
    this.updateAgentExpertise(agentId, topic, sentiment);
  }

  /**
   * Update agent's expertise in a topic
   */
  updateAgentExpertise(agentId, topic, sentiment = 'neutral') {
    if (!this.agentTopicExpertise[agentId]) {
      this.agentTopicExpertise[agentId] = {};
    }

    if (!this.agentTopicExpertise[agentId][topic]) {
      this.agentTopicExpertise[agentId][topic] = {
        level: 0,
        mentions: 0,
        lastMentioned: Date.now(),
        confidenceLevel: 50,
      };
    }

    const expertise = this.agentTopicExpertise[agentId][topic];
    expertise.mentions++;
    expertise.lastMentioned = Date.now();

    // Increase expertise level based on interaction
    if (sentiment === 'positive') {
      expertise.level = Math.min(100, expertise.level + 2);
      expertise.confidenceLevel = Math.min(100, expertise.confidenceLevel + 3);
    } else if (sentiment === 'questioned') {
      expertise.level = Math.max(0, expertise.level - 1);
      expertise.confidenceLevel = Math.max(50, expertise.confidenceLevel - 2);
    } else {
      expertise.level = Math.min(100, expertise.level + 1);
    }
  }

  /**
   * Get topic information
   */
  getTopic(topic) {
    return this.topics[topic] || null;
  }

  /**
   * Get recent discussion on topic
   */
  getRecentDiscussions(topic, count = 5) {
    const topicData = this.topics[topic];
    if (!topicData) return [];

    return topicData.discussions.slice(-count);
  }

  /**
   * Get agent expertise in topic
   */
  getAgentTopicExpertise(agentId, topic) {
    return (this.agentTopicExpertise[agentId] || {})[topic] || null;
  }

  /**
   * Get all topics
   */
  getAllTopics() {
    return Object.values(this.topics);
  }

  /**
   * Get trending topics
   */
  getTrendingTopics(count = 5) {
    return Object.values(this.topics)
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, count);
  }

  /**
   * Get agent's best topics (highest expertise)
   */
  getAgentBestTopics(agentId, count = 3) {
    const expertise = this.agentTopicExpertise[agentId] || {};

    return Object.entries(expertise)
      .sort((a, b) => b[1].level - a[1].level)
      .slice(0, count)
      .map(([topic, data]) => ({ topic, ...data }));
  }

  /**
   * Link related topics
   */
  linkRelatedTopics(topic1, topic2) {
    if (this.topics[topic1]) {
      this.topics[topic1].relatedTopics.add(topic2);
    }
    if (this.topics[topic2]) {
      this.topics[topic2].relatedTopics.add(topic1);
    }
  }

  /**
   * Get related topics
   */
  getRelatedTopics(topic) {
    const topicData = this.topics[topic];
    return topicData ? Array.from(topicData.relatedTopics) : [];
  }

  /**
   * Get topic context for agent
   */
  getTopicContext(topic) {
    const topicData = this.topics[topic];
    if (!topicData) return null;

    return {
      topic,
      discussionCount: topicData.mentions,
      lastMentioned: topicData.lastMentioned,
      participatingAgents: Array.from(topicData.agents),
      recentDiscussions: topicData.discussions.slice(-3),
      relatedTopics: Array.from(topicData.relatedTopics),
    };
  }

  /**
   * Clear memory
   */
  clear() {
    this.topics = {};
    this.agentTopicExpertise = {};
  }

  /**
   * Get summary
   */
  getSummary() {
    return {
      totalTopics: Object.keys(this.topics).length,
      trendingTopics: this.getTrendingTopics(3),
      agentExpertise: Object.entries(this.agentTopicExpertise).map(([agentId, topics]) => ({
        agentId,
        topicCount: Object.keys(topics).length,
        bestTopics: this.getAgentBestTopics(agentId, 2),
      })),
    };
  }
}

export const topicMemorySystem = new TopicMemorySystem();
