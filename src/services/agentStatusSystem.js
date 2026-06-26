/**
 * Agent Status System
 * Tracks real-time status and activity of each agent
 */

export class AgentStatusSystem {
  constructor() {
    this.agentStatus = {
      alex: {
        agentId: 'alex',
        name: 'Alex',
        status: 'idle', // idle, typing, thinking, responding
        lastActivity: null,
        responseCount: 0,
        totalResponseTime: 0,
        consecutiveResponses: 0,
        cooldownUntil: null,
        availability: true,
      },
      mia: {
        agentId: 'mia',
        name: 'Mia',
        status: 'idle',
        lastActivity: null,
        responseCount: 0,
        totalResponseTime: 0,
        consecutiveResponses: 0,
        cooldownUntil: null,
        availability: true,
      },
      noah: {
        agentId: 'noah',
        name: 'Noah',
        status: 'idle',
        lastActivity: null,
        responseCount: 0,
        totalResponseTime: 0,
        consecutiveResponses: 0,
        cooldownUntil: null,
        availability: true,
      },
    };

    this.listeners = [];
  }

  /**
   * Set agent status
   */
  setStatus(agentId, status) {
    if (!this.agentStatus[agentId]) return false;

    this.agentStatus[agentId].status = status;
    this.agentStatus[agentId].lastActivity = new Date().toISOString();

    this.notifyListeners(agentId, status);
    return true;
  }

  /**
   * Get agent status
   */
  getStatus(agentId) {
    return this.agentStatus[agentId] || null;
  }

  /**
   * Get all agents status
   */
  getAllStatus() {
    return { ...this.agentStatus };
  }

  /**
   * Record response
   */
  recordResponse(agentId, responseTime) {
    const agent = this.agentStatus[agentId];
    if (!agent) return;

    agent.responseCount++;
    agent.totalResponseTime += responseTime;
    agent.consecutiveResponses++;
    agent.lastActivity = new Date().toISOString();
    agent.status = 'idle';

    // Track cooldown
    const cooldownDuration = this.calculateCooldown(agentId);
    agent.cooldownUntil = new Date(Date.now() + cooldownDuration).toISOString();

    this.notifyListeners(agentId, 'idle');
  }

  /**
   * Calculate cooldown based on consecutive responses
   */
  calculateCooldown(agentId) {
    const agent = this.agentStatus[agentId];
    const baseCD = 2000; // 2 seconds
    const increment = agent.consecutiveResponses > 2 ? 1000 : 0;

    return baseCD + increment;
  }

  /**
   * Check if agent is available
   */
  isAvailable(agentId) {
    const agent = this.agentStatus[agentId];
    if (!agent) return false;

    const cooldownExpired = !agent.cooldownUntil || new Date() > new Date(agent.cooldownUntil);
    return agent.availability && cooldownExpired && agent.status !== 'typing';
  }

  /**
   * Set agent availability
   */
  setAvailability(agentId, available) {
    const agent = this.agentStatus[agentId];
    if (!agent) return false;

    agent.availability = available;
    return true;
  }

  /**
   * Get activity summary
   */
  getActivitySummary() {
    const summary = {};

    Object.keys(this.agentStatus).forEach((agentId) => {
      const agent = this.agentStatus[agentId];
      const avgResponseTime = agent.responseCount > 0
        ? agent.totalResponseTime / agent.responseCount
        : 0;

      summary[agentId] = {
        name: agent.name,
        status: agent.status,
        responseCount: agent.responseCount,
        avgResponseTime: Math.round(avgResponseTime),
        available: this.isAvailable(agentId),
      };
    });

    return summary;
  }

  /**
   * Reset agent stats
   */
  resetStats(agentId) {
    const agent = this.agentStatus[agentId];
    if (!agent) return false;

    agent.responseCount = 0;
    agent.totalResponseTime = 0;
    agent.consecutiveResponses = 0;
    agent.cooldownUntil = null;

    return true;
  }

  /**
   * Reset all stats
   */
  resetAllStats() {
    Object.keys(this.agentStatus).forEach((agentId) => {
      this.resetStats(agentId);
    });
  }

  /**
   * Subscribe to status changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Notify listeners of status change
   */
  notifyListeners(agentId, status) {
    const agent = this.agentStatus[agentId];
    this.listeners.forEach((listener) => {
      listener({
        agentId,
        name: agent.name,
        status,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Get most active agent
   */
  getMostActiveAgent() {
    let mostActive = null;
    let maxResponses = 0;

    Object.keys(this.agentStatus).forEach((agentId) => {
      const agent = this.agentStatus[agentId];
      if (agent.responseCount > maxResponses) {
        maxResponses = agent.responseCount;
        mostActive = agent;
      }
    });

    return mostActive;
  }

  /**
   * Get fastest responding agent
   */
  getFastestAgent() {
    let fastest = null;
    let minTime = Infinity;

    Object.keys(this.agentStatus).forEach((agentId) => {
      const agent = this.agentStatus[agentId];
      if (agent.responseCount > 0) {
        const avgTime = agent.totalResponseTime / agent.responseCount;
        if (avgTime < minTime) {
          minTime = avgTime;
          fastest = agent;
        }
      }
    });

    return fastest;
  }
}

export const agentStatusSystem = new AgentStatusSystem();
