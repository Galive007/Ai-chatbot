/**
 * Memory Engine
 * Manages agent memories and long-term context retention
 */
import { db } from '@/storage/db/dexie';

export class MemoryEngine {
  constructor() {
    this.agentMemories = {};
    this.conversationSummary = '';
    this.topics = [];
    this.relationships = {};
    this.initializeMemories();
    // Load persisted memories (non-blocking)
    this.loadFromDb().catch(() => { });
  }

  initializeMemories() {
    const agents = ['alex', 'mia', 'noah'];
    agents.forEach((agentId) => {
      this.agentMemories[agentId] = {
        facts: [],
        preferences: [],
        recentInteractions: [],
        expertise: {},
      };
    });
  }

  /**
   * Store a fact about what agents learn from conversation
   */
  addFact(agentId, fact, importance = 'medium') {
    if (!this.agentMemories[agentId]) return;

    this.agentMemories[agentId].facts.push({
      content: fact,
      timestamp: new Date().toISOString(),
      importance,
    });

    // Keep only recent facts (last 50 per agent)
    if (this.agentMemories[agentId].facts.length > 50) {
      this.agentMemories[agentId].facts.shift();
    }

    // persist agent memory
    this.saveToDb(agentId).catch((e) => console.error('Failed to persist memory:', e));
  }

  /**
   * Track relationship between agents
   */
  updateRelationship(agent1, agent2, sentiment) {
    const key = [agent1, agent2].sort().join('-');
    this.relationships[key] = {
      agents: [agent1, agent2],
      sentiment, // positive, neutral, negative
      interactions: (this.relationships[key]?.interactions || 0) + 1,
    };
  }

  /**
   * Extract context from recent messages for agent recall
   */
  extractMessageContext(messages, limit = 10) {
    return messages.slice(-limit).map((m) => ({
      speaker: m.senderName,
      text: m.text,
      time: m.createdAt,
      type: m.senderType,
    }));
  }

  /**
   * Generate a memory-aware context for an agent
   */
  getMemoryAwareContext(agentId, recentMessages) {
    const memory = this.agentMemories[agentId];
    const recentFacts = memory.facts.slice(-5);
    const relevantTopics = this.topics.filter((t) => t.relevant?.includes(agentId));

    return {
      facts: recentFacts,
      topics: relevantTopics,
      recentInteractions: memory.recentInteractions.slice(-3),
      relationships: Object.entries(this.relationships)
        .filter(([key]) => key.includes(agentId))
        .map(([_, value]) => value),
    };
  }

  /**
   * Store interaction between agents
   */
  recordInteraction(agentId, otherAgent, messageType) {
    if (!this.agentMemories[agentId]) return;

    this.agentMemories[agentId].recentInteractions.push({
      with: otherAgent,
      type: messageType,
      timestamp: new Date().toISOString(),
    });

    // Keep last 20 interactions
    if (this.agentMemories[agentId].recentInteractions.length > 20) {
      this.agentMemories[agentId].recentInteractions.shift();
    }

    this.updateRelationship(agentId, otherAgent, 'positive');

    // persist
    this.saveToDb(agentId).catch((e) => console.error('Failed to persist memory:', e));
  }

  /**
   * Update knowledge expertise for an agent
   */
  updateExpertise(agentId, topic, confidence) {
    if (!this.agentMemories[agentId]) return;

    this.agentMemories[agentId].expertise[topic] = {
      confidence,
      lastMentioned: new Date().toISOString(),
    };

    // persist
    this.saveToDb(agentId).catch((e) => console.error('Failed to persist memory:', e));
  }

  /**
   * Get agent memory
   */
  getMemory(agentId) {
    return this.agentMemories[agentId] || null;
  }

  /**
   * Clear memory (for testing or reset)
   */
  async clearMemory(agentId = null) {
    if (agentId) {
      if (this.agentMemories[agentId]) {
        this.agentMemories[agentId] = {
          facts: [],
          preferences: [],
          recentInteractions: [],
          expertise: {},
        };
      }
    } else {
      this.initializeMemories();
      this.topics = [];
      this.relationships = {};
    }

    try {
      await db.memories.clear();
      await db.analytics.clear();
    } catch (error) {
      console.error('Failed to clear persisted memory:', error);
    }
  }

  /**
   * Track conversation topics over time
   */
  recordTopic(topic, relevantAgents) {
    const existing = this.topics.find((t) => t.name === topic);
    if (existing) {
      existing.mentions++;
      existing.lastMentioned = new Date().toISOString();
    } else {
      this.topics.push({
        name: topic,
        mentions: 1,
        relevant: relevantAgents,
        introduced: new Date().toISOString(),
        lastMentioned: new Date().toISOString(),
      });
    }

    // Keep last 20 topics
    if (this.topics.length > 20) {
      this.topics.shift();
    }

    // persist topics snapshot
    this.saveTopicsToDb().catch((e) => console.error('Failed to persist topics:', e));
  }

  async saveToDb(agentId) {
    try {
      const payload = {
        id: `memory_${agentId}`,
        agentId,
        data: this.agentMemories[agentId],
        createdAt: Date.now(),
      };

      await db.memories.put(payload);
    } catch (error) {
      throw error;
    }
  }

  async loadFromDb() {
    try {
      const rows = await db.memories.toArray();
      rows.forEach((r) => {
        if (r && r.agentId && r.data) {
          this.agentMemories[r.agentId] = r.data;
        }
      });
    } catch (error) {
      // ignore
    }
  }

  async saveTopicsToDb() {
    try {
      const payload = {
        id: `topics_snapshot`,
        data: this.topics,
        createdAt: Date.now(),
      };

      await db.analytics.put(payload);
    } catch (error) {
      throw error;
    }
  }
}

export const memoryEngine = new MemoryEngine();
