/**
 * Agent Relationship System
 * Tracks and evolves relationships between agents based on interactions
 */

export class AgentRelationshipSystem {
  constructor() {
    this.relationships = {};
    this.initializeRelationships();
  }

  /**
   * Initialize relationships between all agents
   */
  initializeRelationships() {
    const agents = ['alex', 'mia', 'noah'];

    agents.forEach((agent1) => {
      agents.forEach((agent2) => {
        if (agent1 !== agent2) {
          const key = this.getRelationshipKey(agent1, agent2);
          if (!this.relationships[key]) {
            this.relationships[key] = {
              agent1,
              agent2,
              rapport: 50, // 0-100 scale
              trust: 50,
              collaboration: 50,
              disagreements: 0,
              agreements: 0,
              interactions: 0,
              lastInteraction: null,
              notes: [],
            };
          }
        }
      });
    });
  }

  /**
   * Get relationship key
   */
  getRelationshipKey(agent1, agent2) {
    const sorted = [agent1, agent2].sort();
    return `${sorted[0]}-${sorted[1]}`;
  }

  /**
   * Record interaction between agents
   */
  recordInteraction(agent1, agent2, type = 'message', sentiment = 'neutral') {
    const key = this.getRelationshipKey(agent1, agent2);
    const rel = this.relationships[key];

    if (!rel) return;

    rel.interactions++;
    rel.lastInteraction = Date.now();

    if (type === 'agreement') {
      rel.agreements++;
      rel.rapport = Math.min(100, rel.rapport + 5);
      rel.trust = Math.min(100, rel.trust + 3);
      rel.collaboration = Math.min(100, rel.collaboration + 4);
    } else if (type === 'disagreement') {
      rel.disagreements++;
      rel.rapport = Math.max(0, rel.rapport - 3);
      rel.collaboration = Math.max(0, rel.collaboration - 2);
    } else if (type === 'helped') {
      rel.trust = Math.min(100, rel.trust + 8);
      rel.rapport = Math.min(100, rel.rapport + 5);
    } else if (type === 'ignored') {
      rel.rapport = Math.max(0, rel.rapport - 2);
    }

    // Apply sentiment modifier
    if (sentiment === 'positive') {
      rel.rapport = Math.min(100, rel.rapport + 2);
    } else if (sentiment === 'negative') {
      rel.rapport = Math.max(0, rel.rapport - 2);
    }

    // Cap values
    rel.rapport = Math.max(0, Math.min(100, rel.rapport));
    rel.trust = Math.max(0, Math.min(100, rel.trust));
    rel.collaboration = Math.max(0, Math.min(100, rel.collaboration));
  }

  /**
   * Get relationship between two agents
   */
  getRelationship(agent1, agent2) {
    const key = this.getRelationshipKey(agent1, agent2);
    return this.relationships[key];
  }

  /**
   * Get all relationships for an agent
   */
  getAgentRelationships(agentId) {
    return Object.values(this.relationships).filter(
      (rel) => rel.agent1 === agentId || rel.agent2 === agentId,
    );
  }

  /**
   * Get relationship description
   */
  getRelationshipDescription(agent1, agent2) {
    const rel = this.getRelationship(agent1, agent2);
    if (!rel) return 'Unknown';

    const { rapport, trust, collaboration } = rel;

    if (rapport > 75 && trust > 75) {
      return 'Very Close Friends';
    }
    if (rapport > 60 && collaboration > 60) {
      return 'Good Collaborators';
    }
    if (rapport > 50) {
      return 'Friendly';
    }
    if (rapport < 30) {
      return 'Distant';
    }
    return 'Acquaintances';
  }

  /**
   * Get recommendation for interaction
   */
  getInteractionRecommendation(agent1, agent2) {
    const rel = this.getRelationship(agent1, agent2);
    if (!rel) return null;

    const { rapport, trust, collaboration } = rel;

    return {
      shouldWork: collaboration > 50,
      shouldTrust: trust > 60,
      canBridge: rapport > 40 && rapport < 70,
      likelyToAgree: rapport > 70,
      description: this.getRelationshipDescription(agent1, agent2),
    };
  }

  /**
   * Add note to relationship
   */
  addNote(agent1, agent2, note) {
    const rel = this.getRelationship(agent1, agent2);
    if (rel) {
      rel.notes.push({
        text: note,
        timestamp: Date.now(),
      });

      // Keep last 10 notes
      if (rel.notes.length > 10) {
        rel.notes.shift();
      }
    }
  }

  /**
   * Get all relationships summary
   */
  getSummary() {
    const summary = {};

    Object.entries(this.relationships).forEach(([key, rel]) => {
      summary[key] = {
        description: this.getRelationshipDescription(rel.agent1, rel.agent2),
        rapport: rel.rapport,
        trust: rel.trust,
        collaboration: rel.collaboration,
        interactions: rel.interactions,
      };
    });

    return summary;
  }

  /**
   * Reset relationships
   */
  reset() {
    this.relationships = {};
    this.initializeRelationships();
  }
}

export const agentRelationshipSystem = new AgentRelationshipSystem();
