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
    if (this.processing) {
      console.warn('⚠️ Conversation engine is already processing a message');
      return null;
    }

    this.processing = true;
    this.lastProcessedTime = Date.now();

    try {
      console.log('🔄 Processing user message:', message.text);

      // Step 1: Record in conversation manager
      conversationManager.addMessageToSession(message);

      // Step 2: Extract conversation context
      const topic = parseTopics(message.text);
      const mentionedAgents = detectMentions(message.text);
      console.log('📌 Extracted topic:', topic, 'Mentioned agents:', mentionedAgents);

      // Step 3: Record topic discussion
      topicMemorySystem.recordTopicDiscussion(topic, 'user', message.text, 'neutral');

      // Step 4: Build enhanced context
      const context = this.buildEnhancedContext(message, allMessages, topic, mentionedAgents);
      console.log('🎯 Built enhanced context with mood:', context.userMood, 'intent:', context.userIntent);

      // Step 5: Select responding agents
      const responders = this.selectResponders(context, allMessages);
      console.log('✨ Selected responders:', responders.map(r => r.agentId), 'Total:', responders.length);

      if (responders.length === 0) {
        console.log('⚠️ No agents selected to respond');
        this.processing = false;
        return null;
      }

      // Step 6: Generate and queue responses
      const responses = await this.generateAndQueueResponses(responders, context, message, handlers);
      console.log('📝 Generated responses:', responses.length);

      // Step 7: Record agent interactions
      this.recordAgentInteractions(responders, message);

      agentBehaviorEngine.restoreStateOverTime();
      return responses;
    } catch (error) {
      console.error('❌ Enhanced Conversation Engine error:', error);
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
   * Select which agents should respond (MAX 2 to prevent API spam)
   */
  selectResponders(context, allMessages) {
    const agentIds = agentBehaviorEngine.selectResponders(context);

    // LIMIT: Only select max 2 agents to prevent API rate limit spam
    const limited = agentIds.slice(0, 2);

    if (limited.length > 0) {
      return limited.map((agentId) => ({
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
   * Generate and queue responses with fallback handling
   */
  async generateAndQueueResponses(responders, context, userMessage, handlers = {}) {
    const responses = [];

    for (const responder of responders) {
      const { agentId, priority } = responder;
      const replyType = agentBehaviorEngine.determineReplyType(agentId, context);
      console.log(`🤖 Generating response for ${agentId}, reply type: ${replyType}`);

      // Notify UI of typing start
      const typingDelay = agentBehaviorEngine.getTypingDelay(agentId);
      if (handlers.onTypingStart) {
        handlers.onTypingStart(agentId, typingDelay);
      }

      try {
        const agentConfig = AGENT_CONFIG[agentId];
        const systemPrompt = PromptBuilder.buildSystemPrompt(agentId);
        const userPrompt = this.buildEnhancedPrompt(agentId, context, userMessage, replyType);

        const contextualDelay = agentBehaviorEngine.getTypingDelay(agentId, context);
        console.log(`⏳ ${agentId} typing delay: ${contextualDelay}ms`);
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
        let finalText = null;
        let fallbackReason = null;

        if (!response.ok) {
          const errorMsg = data?.error || `HTTP ${response.status}`;
          const isRateLimit = response.status === 429 || /429|Rate limit/i.test(errorMsg);

          if (isRateLimit) {
            console.warn(`⚠️ Rate limit detected for ${agentId}. Using fallback response.`);
            finalText = this.generateFallbackResponse(agentId, context, 'RATE_LIMIT');
            fallbackReason = 'RATE_LIMIT';
          } else {
            console.warn(`⚠️ API error for ${agentId}. Using fallback response:`, errorMsg);
            finalText = this.generateFallbackResponse(agentId, context, errorMsg);
            fallbackReason = 'API_ERROR';
          }
        } else if (data.success && data.result) {
          console.log(`✅ ${agentId} response successful`);
          finalText = data.result.text;
        } else {
          console.warn(`⚠️ ${agentId} API response not successful. Using fallback.`);
          finalText = this.generateFallbackResponse(agentId, context, 'INVALID_API_RESPONSE');
          fallbackReason = 'INVALID_API_RESPONSE';
        }

        if (finalText) {
          const aiMessage = {
            agentId,
            agentName: agentConfig.name,
            text: finalText,
            timestamp: new Date().toISOString(),
            confidence: fallbackReason ? 0.6 : this.calculateResponseConfidence(agentId, context),
          };

          responses.push(aiMessage);

          conversationManager.addMessageToSession({
            senderId: agentId,
            senderName: agentConfig.name,
            senderType: 'ai',
            text: finalText,
            createdAt: new Date().toISOString(),
          });

          try {
            agentStatusSystem.recordResponse(agentId, contextualDelay || 0);
          } catch (e) {
            // ignore
          }

          if (!fallbackReason) {
            topicMemorySystem.recordTopicDiscussion(context.topic, agentId, finalText, 'positive');
          }

          if (handlers.onAgentResponse) {
            await handlers.onAgentResponse(aiMessage);
          }
        }
      } catch (error) {
        const agentConfig = AGENT_CONFIG[agentId];
        const finalText = this.generateFallbackResponse(agentId, context, error.message || 'UNKNOWN_ERROR');

        if (finalText) {
          console.warn(`⚠️ Fallback response used for ${agentId} after exception:`, error.message);
          const aiMessage = {
            agentId,
            agentName: agentConfig.name,
            text: finalText,
            timestamp: new Date().toISOString(),
            confidence: 0.6,
          };

          responses.push(aiMessage);

          if (handlers.onAgentResponse) {
            await handlers.onAgentResponse(aiMessage);
          }
        } else {
          console.error(`❌ Failed to generate fallback response for ${agentId}:`, error.message);
        }
      } finally {
        if (handlers.onTypingEnd) {
          handlers.onTypingEnd(agentId);
        }
      }
    }

    return responses;
  }

  /**
   * Generate fallback response when API fails
   */
  generateFallbackResponse(agentId, context, error) {
    const agentConfig = AGENT_CONFIG[agentId];
    const name = agentConfig.name;
    const mood = context.userMood || 'neutral';
    const topic = context.topic || 'that';

    // Rate limit message
    if (error === 'RATE_LIMIT') {
      const rateMessages = [
        `Hey, API's being slow right now. But about ${topic}... that's interesting 👀`,
        `Sorry, bit of a lag on my end. Anyway, ${topic}? What do you think about it?`,
        `API's taking a breather lol. But really, tell me more about ${topic}!`,
        `Internet hiccup! Anyway, back to ${topic}... 😄`,
      ];
      return rateMessages[Math.floor(Math.random() * rateMessages.length)];
    }

    // Generic fallback responses based on mood
    if (mood === 'bored') {
      return `Okay so ${topic} might actually be more interesting than you think... wanna hear about it?`;
    } else if (mood === 'sad') {
      return `Yeah, ${topic} is something to think about. You doing okay though? 💙`;
    } else if (mood === 'excited') {
      return `YES! I'm here for this ${topic} energy! Tell me everything! �`;
    } else if (mood === 'stressed') {
      return `Deep breath! About ${topic}, let's break it down step by step, yeah?`;
    }

    // Default responses
    const defaults = [
      `Yo, ${topic}! That's something. What's your take?`,
      `Interesting point about ${topic}. I got thoughts on that.`,
      `${topic}, huh? Yeah, I feel that. What else?`,
      `That's wild. So about ${topic}...`,
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
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
