/**
 * Conversation Engine
 * Central coordinator of the entire application.
 * Receives messages, analyzes conversation, and orchestrates all subsystems.
 */

import { agentBehaviorEngine, AGENT_CONFIG } from '@/services/agentBehaviorEngine';
import { parseTopics, detectMentions } from '@/utils/conversationUtils';

class ConversationEngine {
  constructor() {
    this.currentTopic = null;
    this.conversationHistory = [];
    this.processing = false;
  }

  /**
   * Main entry point: process a new user message
   */
  async processMessage(message, messages, handlers) {
    if (this.processing) return null;
    this.processing = true;

    try {
      // Update conversation history
      this.conversationHistory.push(message);

      // Detect current topic
      this.currentTopic = parseTopics(message.text);

      // Build conversation context
      const context = this.buildContext(message, messages);

      // Select responding agents using behavior engine
      const responders = agentBehaviorEngine.selectResponders(context);

      if (responders.length === 0) {
        this.processing = false;
        return null;
      }

      // Generate responses from selected agents
      const responses = await this.generateResponses(responders, context, handlers);

      // Update agent states after responses
      responders.forEach((agentId) => {
        agentBehaviorEngine.updateStateAfterReply(agentId);
      });

      return responses;
    } catch (error) {
      console.error('Conversation Engine error:', error);
      this.processing = false;
      return null;
    } finally {
      this.processing = false;
      // Gradually restore agent states
      agentBehaviorEngine.restoreStateOverTime();
    }
  }

  /**
   * Build conversation context for AI agents
   */
  buildContext(message, messages) {
    const recentMessages = messages.slice(-8).map((m) => ({
      sender: m.senderName,
      text: m.text,
    }));

    const mentionedAgents = detectMentions(message.text);

    return {
      topic: this.currentTopic,
      mentionedAgents,
      recentMessages,
      currentSpeaker: message.senderName,
      conversationLength: messages.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate responses from selected agents
   */
  async generateResponses(responders, context, handlers) {
    const responses = [];

    for (const agentId of responders) {
      const agentConfig = AGENT_CONFIG[agentId];
      if (!agentConfig) continue;

      try {
        // Get typing delay
        const typingDelay = agentBehaviorEngine.getTypingDelay(agentId);

        // Notify UI of typing
        if (handlers.onTypingStart) {
          handlers.onTypingStart(agentId, typingDelay);
        }

        // Wait for typing delay
        await new Promise((resolve) => setTimeout(resolve, typingDelay));

        // Generate response via API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            agentConfig,
            context,
            personalities: Object.keys(AGENT_CONFIG).map((id) => ({
              agentId: id,
              personality: AGENT_CONFIG[id].personality,
            })),
          }),
        });

        const data = await response.json();

        if (data.success && data.result) {
          responses.push({
            agentId,
            agentName: agentConfig.name,
            text: data.result.text,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to generate response for ${agentId}:`, error);
      }
    }

    return responses;
  }

  /**
   * Get current conversation state
   */
  getState() {
    return {
      topic: this.currentTopic,
      messageCount: this.conversationHistory.length,
      processing: this.processing,
    };
  }
}

export const conversationEngine = new ConversationEngine();
