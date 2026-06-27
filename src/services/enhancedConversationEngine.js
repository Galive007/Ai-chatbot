/**
 * Enhanced Conversation Engine
 * Integrates all behavior, memory, relationship, and topic systems for realistic multi-agent conversations
 */

import { agentBehaviorEngine, AGENT_CONFIG } from '@/services/agentBehaviorEngine';
import { memoryEngine } from '@/services/memoryEngine';
import { conversationManager } from '@/services/conversationManager';
import { agentRelationshipSystem } from '@/services/agentRelationshipSystem';
import { agentStatusSystem } from '@/services/agentStatusSystem';
import { topicMemorySystem } from '@/services/topicMemorySystem';
import { messageQueueSystem } from '@/services/messageQueueSystem';
import { parseTopics, detectMentions, detectUserMood, detectUserIntent, inferConversationGoal } from '@/utils/conversationUtils';
import { PromptBuilder } from '@/services/promptBuilder';

export class EnhancedConversationEngine {
  constructor() {
    this.processing = false;
    this.lastProcessedTime = null;
  }

  /**
   * Process a user message through the complete pipeline
   */
  async processUserMessage(message, allMessages, handlers = {}) {
    if (this.processing) return null;

    this.processing = true;
    this.lastProcessedTime = Date.now();

    try {
      // Step 1: Record in conversation manager
      conversationManager.addMessageToSession(message);

      // Step 2: Extract conversation context
      const topic = parseTopics(message.text);
      const mentionedAgents = detectMentions(message.text);

      // Step 3: Record topic discussion
      topicMemorySystem.recordTopicDiscussion(topic, 'user', message.text, 'neutral');

      // Step 4: Build enhanced context
      const context = this.buildEnhancedContext(message, allMessages, topic, mentionedAgents);

      // Step 5: Select responding agents
      const responders = this.selectResponders(context, allMessages);

      if (responders.length === 0) {
        this.processing = false;
        return null;
      }

      // Step 6: Generate and queue responses
      const responses = await this.generateAndQueueResponses(responders, context, message, handlers);

      // Step 7: Record agent interactions
      this.recordAgentInteractions(responders, message);

      agentBehaviorEngine.restoreStateOverTime();
      return responses;
    } catch (error) {
      console.error('Enhanced Conversation Engine error:', error);
      agentBehaviorEngine.restoreStateOverTime();
      this.processing = false;
      return null;
    } finally {
      this.processing = false;
    }
  }

  /**
   * Build enhanced context with all systems
   */
  buildEnhancedContext(message, allMessages, topic, mentionedAgents) {
    const recentMessages = conversationManager.getRecentMessages(8);
    const userMood = detectUserMood(message.text);
    const userIntent = detectUserIntent(message.text);
    const conversationGoal = inferConversationGoal(message.text, userMood);
    const recentAgentResponses = recentMessages
      .filter((msg) => msg.sender !== 'You')
      .slice(-4);

    return {
      topic,
      mentionedAgents,
      recentMessages,
      currentSpeaker: message.senderName,
      conversationLength: allMessages.length,
      timestamp: new Date().toISOString(),
      agentRelationships: agentRelationshipSystem.getSummary(),
      topicContext: topicMemorySystem.getTopicContext(topic),
      trendingTopics: topicMemorySystem.getTrendingTopics(3),
      userMood,
      userIntent,
      conversationGoal,
      recentAgentResponses,
      userMessage: message.text,
    };
  }

  /**
   * Select which agents should respond
   */
  selectResponders(context, allMessages) {
    const agentIds = agentBehaviorEngine.selectResponders(context);

    if (agentIds.length > 0) {
      return agentIds.map((agentId) => ({
        agentId,
        priority: 'normal',
        reason: 'behavior',
      }));
    }

    const best = this.selectBestResponder(context, allMessages);
    return best ? [{ agentId: best, priority: 'normal', reason: 'default' }] : [];
  }

  /**
   * Select the best suited agent if no one volunteered
   */
  selectBestResponder(context, allMessages) {
    let bestAgent = null;
    let bestScore = -Infinity;

    Object.keys(agentBehaviorEngine.agentStates).forEach((agentId) => {
      if (agentId === 'user') return;

      const state = agentBehaviorEngine.getAgentState(agentId);
      const score = agentBehaviorEngine.calculateReplyScore(state, context);

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentId;
      }
    });

    return bestAgent;
  }

  /**
   * Generate and queue responses
   */
  async generateAndQueueResponses(responders, context, userMessage, handlers = {}) {
    const responses = [];

    for (const responder of responders) {
      const { agentId, priority } = responder;
      const replyType = agentBehaviorEngine.determineReplyType(agentId, context);

      // Notify UI of typing start
      const typingDelay = agentBehaviorEngine.getTypingDelay(agentId);
      if (handlers.onTypingStart) {
        handlers.onTypingStart(agentId, typingDelay);
      }

      try {
        // Generate response via API
        const agentConfig = AGENT_CONFIG[agentId];
        const systemPrompt = PromptBuilder.buildSystemPrompt(agentId);
        const userPrompt = this.buildEnhancedPrompt(agentId, context, userMessage, replyType);

        // Wait through a natural typing delay, adjusted by context
        const contextualDelay = agentBehaviorEngine.getTypingDelay(agentId, context);
        await new Promise((resolve) => setTimeout(resolve, contextualDelay));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            agentConfig,
            context,
            systemPrompt,
            userPrompt,
            generationConfig: this.getGenerationConfig(agentId),
          }),
        });

        const data = await response.json();

        if (data.success && data.result) {
          const aiMessage = {
            agentId,
            agentName: agentConfig.name,
            text: data.result.text,
            timestamp: new Date().toISOString(),
            confidence: this.calculateResponseConfidence(agentId, context),
          };

          responses.push(aiMessage);

          // Record in conversation manager
          conversationManager.addMessageToSession({
            senderId: agentId,
            senderName: agentConfig.name,
            senderType: 'ai',
            text: data.result.text,
            createdAt: new Date().toISOString(),
          });

          // Update agent status with response time
          try {
            agentStatusSystem.recordResponse(agentId, contextualDelay || 0);
          } catch (e) {
            // ignore
          }

          // Record topic discussion
          topicMemorySystem.recordTopicDiscussion(context.topic, agentId, data.result.text, 'positive');

          if (handlers.onAgentResponse) {
            await handlers.onAgentResponse(aiMessage);
          }
        }
      } catch (error) {
        console.error(`Failed to generate response for ${agentId}:`, error);
      } finally {
        if (handlers.onTypingEnd) {
          handlers.onTypingEnd(agentId);
        }
      }
    }

    return responses;
  }

  /**
   * Build enhanced prompt with relationship and topic context
   */
  buildEnhancedPrompt(agentId, context, userMessage, replyType) {
    let prompt = PromptBuilder.buildUserPrompt(agentId, context, replyType);

    // Add reply style context
    if (replyType) {
      prompt += `\n\nReply style: ${replyType}.`;
    }

    // Add relationship context
    const relationships = agentRelationshipSystem.getAgentRelationships(agentId);
    if (relationships.length > 0) {
      const relContext = relationships
        .map((rel) => {
          const other = rel.agent1 === agentId ? rel.agent2 : rel.agent1;
          return `${other}: ${rel.rapport}/100 rapport`;
        })
        .join(', ');

      prompt += `\n\nRelationships: ${relContext}`;
    }

    // Add topic expertise context
    const bestTopics = topicMemorySystem.getAgentBestTopics(agentId, 2);
    if (bestTopics.length > 0) {
      const topicExpertise = bestTopics.map((t) => `${t.topic} (${t.level}%)`).join(', ');
      prompt += `\n\nYour expertise: ${topicExpertise}`;
    }

    return prompt;
  }

  /**
   * Calculate response confidence based on expertise
   */
  calculateResponseConfidence(agentId, context) {
    const topicExpertise = topicMemorySystem.getAgentTopicExpertise(agentId, context.topic);
    const agentConfig = AGENT_CONFIG[agentId];

    if (!topicExpertise) {
      return agentConfig?.personality?.confidence || 0.6;
    }

    return Math.max(0.2, Math.min(0.95, topicExpertise.confidenceLevel / 100));
  }

  getGenerationConfig(agentId) {
    const config = AGENT_CONFIG[agentId];
    const personality = config?.personality || {};

    // Map persona to generation settings
    const persona = personality.persona || '';

    if (persona === 'tech_nerd') {
      return { temperature: 0.48, maxTokens: 160, style: 'casual-technical' };
    }

    if (persona === 'debater') {
      return { temperature: 0.65, maxTokens: 120, style: 'opinionated' };
    }

    if (persona === 'creative') {
      return { temperature: 0.9, maxTokens: 140, style: 'playful' };
    }

    // Default balanced
    return { temperature: 0.7, maxTokens: 140, style: 'balanced' };
  }

  /**
   * Record agent interactions for relationships
   */
  recordAgentInteractions(responders, userMessage) {
    responders.forEach((responder) => {
      const { agentId } = responder;

      // Record interaction between agents if multiple responded
      responders.forEach((other) => {
        if (other.agentId !== agentId) {
          agentRelationshipSystem.recordInteraction(agentId, other.agentId, 'collaborated');
        }
      });

      // Update agent state after responding
      agentBehaviorEngine.updateStateAfterReply(agentId);
    });
  }

  /**
   * Get conversation state
   */
  getState() {
    return {
      processing: this.processing,
      lastProcessedTime: this.lastProcessedTime,
      sessionSummary: conversationManager.currentSession?.metadata,
      agentRelationships: agentRelationshipSystem.getSummary(),
      topicMemory: topicMemorySystem.getSummary(),
      queueStatus: messageQueueSystem.getStatus(),
    };
  }

  /**
   * Export full conversation data
   */
  async exportConversation(format = 'json') {
    return conversationManager.exportConversation(format);
  }
}

export const enhancedConversationEngine = new EnhancedConversationEngine();
