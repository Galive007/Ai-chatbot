/**
 * Development Utilities
 * Tools for debugging and monitoring the application
 */

import { agentBehaviorEngine } from '@/services/agentBehaviorEngine';
import { conversationEngine } from '@/services/conversationEngine';
import { memoryEngine } from '@/services/memoryEngine';
import { errorHandler } from '@/services/errorHandler';

export const DevUtils = {
  /**
   * Get current system state
   */
  getSystemState() {
    return {
      conversation: conversationEngine.getState(),
      errors: {
        recent: errorHandler.getRecent(5),
        stats: errorHandler.getStats(),
      },
      agents: Object.keys(agentBehaviorEngine.agentStates).map((agentId) => ({
        agentId,
        state: agentBehaviorEngine.getAgentState(agentId),
        memory: memoryEngine.getMemory(agentId),
      })),
    };
  },

  /**
   * Log agent state
   */
  logAgentState(agentId) {
    const state = agentBehaviorEngine.getAgentState(agentId);
    const memory = memoryEngine.getMemory(agentId);

    console.group(`Agent State: ${agentId}`);
    console.log('Behavior State:', state);
    console.log('Memory:', memory);
    console.groupEnd();
  },

  /**
   * Log all agents
   */
  logAllAgents() {
    console.group('All Agents');
    Object.keys(agentBehaviorEngine.agentStates).forEach((agentId) => {
      this.logAgentState(agentId);
    });
    console.groupEnd();
  },

  /**
   * Log conversation state
   */
  logConversationState() {
    console.log('Conversation State:', conversationEngine.getState());
  },

  /**
   * Test agent reply decision
   */
  testReplyDecision(agentId, context) {
    const shouldReply = agentBehaviorEngine.shouldReply(agentId, context);
    const score = agentBehaviorEngine.calculateReplyScore(agentBehaviorEngine.getAgentState(agentId), context);

    console.log(`Agent ${agentId}:`, {
      shouldReply,
      replyScore: score.toFixed(2),
      context,
    });

    return { shouldReply, score };
  },

  /**
   * Get typing delay
   */
  getTypingDelay(agentId) {
    return agentBehaviorEngine.getTypingDelay(agentId);
  },

  /**
   * Force agent state update
   */
  forceAgentUpdate(agentId, updates) {
    const state = agentBehaviorEngine.getAgentState(agentId);
    Object.assign(state, updates);
    console.log(`Updated agent ${agentId}:`, state);
  },

  /**
   * Simulate message processing
   */
  simulateMessage(text, topic = 'physics') {
    const context = {
      topic,
      recentMessages: [{ sender: 'User', text }],
      mentionedAgents: [],
    };

    console.group(`Simulating Message Processing`);
    console.log('Input:', { text, topic });

    Object.keys(agentBehaviorEngine.agentStates).forEach((agentId) => {
      this.testReplyDecision(agentId, context);
    });

    console.groupEnd();
  },

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      totalMemoryFacts: Object.values(memoryEngine.agentMemories).reduce(
        (sum, mem) => sum + mem.facts.length,
        0,
      ),
      totalTopics: memoryEngine.topics.length,
      totalRelationships: Object.keys(memoryEngine.relationships).length,
      totalErrors: errorHandler.errors.length,
      errorStats: errorHandler.getStats(),
    };
  },

  /**
   * Enable debug mode
   */
  enableDebugMode() {
    window.__appDebug = {
      state: () => this.getSystemState(),
      agents: () => this.logAllAgents(),
      test: (text, topic) => this.simulateMessage(text, topic),
      metrics: () => this.getMetrics(),
      errors: () => errorHandler.getRecent(10),
      clearErrors: () => errorHandler.clear(),
    };

    console.log('%c🔧 Debug Mode Enabled', 'color: #38bdf8; font-size: 14px; font-weight: bold;');
    console.log('Available commands:', window.__appDebug);
  },
};

// Auto-enable debug mode in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    DevUtils.enableDebugMode();
  });
}
