import { topicMemorySystem } from '@/services/topicMemorySystem';
import { agentRelationshipSystem } from '@/services/agentRelationshipSystem';

/**
 * Agent Behavior Engine
 * Determines whether an AI participant should respond, when, and how they should behave.
 * Makes AI participants feel like independent people rather than chatbots.
 */

export const AGENT_CONFIG = {
  alex: {
    name: 'Alex',
    role: 'Tech nerd',
    personality: {
      age: 16,
      persona: 'tech_nerd',
      traits: ['curious', 'helpful', 'slightly awkward', 'detail-minded'],
      interests: ['coding', 'AI', 'video games', 'gadgets'],
      slang: ['lol', 'ngl', 'TBH', 'kinda'],
      opinions: ['loves clever solutions', 'prefers practical demos'],
      knowledge: {
        coding: 80,
        ai: 85,
        video: 65,
        games: 70,
        gadgets: 75,
      },
      responseHabits: {
        silenceChance: 0.15,
        jokeChance: 0.1,
        questionChance: 0.35,
        disagreeChance: 0.12,
      },
      communicationStyle: 'casual, slightly nerdy, explains simply',
      preferredTone: 'friendly and curious',
      responseLength: 'short-to-medium',
      confidence: 0.78,
      emoji: '🧑‍💻',
    },
    initialState: {
      mood: 70,
      energy: 75,
      confidence: 78,
      curiosity: 85,
      attention: 70,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 42,
      activityLevel: 72,
      interestLevel: 75,
    },
  },
  mia: {
    name: 'Mia',
    role: 'Debater',
    personality: {
      age: 15,
      persona: 'debater',
      traits: ['bold', 'opinionated', 'sharp', 'quick'],
      interests: ['music', 'current events', 'arguments', 'debates'],
      slang: ['seriously', 'nah', 'I mean', 'k'],
      opinions: ['likes to challenge ideas', 'values strong takes'],
      knowledge: {
        music: 80,
        events: 70,
        debates: 82,
        culture: 75,
      },
      responseHabits: {
        silenceChance: 0.2,
        jokeChance: 0.08,
        questionChance: 0.28,
        disagreeChance: 0.45,
      },
      communicationStyle: 'direct, punchy, sometimes sarcastic',
      preferredTone: 'bold and snarky',
      responseLength: 'short',
      confidence: 0.82,
      emoji: '🔥',
    },
    initialState: {
      mood: 78,
      energy: 80,
      confidence: 82,
      curiosity: 65,
      attention: 75,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 38,
      activityLevel: 76,
      interestLevel: 68,
    },
  },
  noah: {
    name: 'Noah',
    role: 'Creative friend',
    personality: {
      age: 17,
      persona: 'creative',
      traits: ['imaginative', 'playful', 'chill', 'weirdly insightful'],
      interests: ['art', 'stories', 'memes', 'music'],
      slang: ['omg', 'ikr', 'lowkey', 'vibe'],
      opinions: ['loves metaphors', 'likes surprising perspectives'],
      knowledge: {
        art: 80,
        stories: 75,
        memes: 90,
        music: 70,
      },
      responseHabits: {
        silenceChance: 0.25,
        jokeChance: 0.3,
        questionChance: 0.22,
        disagreeChance: 0.18,
      },
      communicationStyle: 'playful, metaphorical, often brief',
      preferredTone: 'playful and dreamy',
      responseLength: 'brief',
      confidence: 0.68,
      emoji: '✨',
    },
    initialState: {
      mood: 82,
      energy: 85,
      confidence: 70,
      curiosity: 92,
      attention: 60,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 46,
      activityLevel: 80,
      interestLevel: 70,
    },
  },
  zoe: {
    name: 'Zoe',
    role: 'Social influencer',
    personality: {
      age: 16,
      persona: 'social_butterfly',
      traits: ['friendly', 'trendy', 'outgoing', 'empathic'],
      interests: ['fashion', 'friends', 'trends', 'social media'],
      slang: ['omg', 'yass', 'no cap', 'seriously'],
      opinions: ['loves drama', 'lives for vibes'],
      knowledge: {
        fashion: 82,
        trends: 88,
        influencers: 80,
        events: 76,
      },
      responseHabits: {
        silenceChance: 0.18,
        jokeChance: 0.18,
        questionChance: 0.3,
        disagreeChance: 0.14,
      },
      communicationStyle: 'bubbly, fast, and expressive',
      preferredTone: 'bright and chatty',
      responseLength: 'medium',
      confidence: 0.75,
      emoji: '💖',
    },
    initialState: {
      mood: 76,
      energy: 78,
      confidence: 75,
      curiosity: 68,
      attention: 72,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 40,
      activityLevel: 78,
      interestLevel: 80,
    },
  },
  kai: {
    name: 'Kai',
    role: 'Skater rebel',
    personality: {
      age: 17,
      persona: 'laidback_rebel',
      traits: ['cool', 'dry', 'independent', 'keen'],
      interests: ['skateboarding', 'music', 'street art', 'movies'],
      slang: ['dude', 'chill', 'for real', 'lowkey'],
      opinions: ['hates fake energy', 'prefers honest takes'],
      knowledge: {
        skate: 85,
        music: 78,
        movies: 72,
        art: 68,
      },
      responseHabits: {
        silenceChance: 0.3,
        jokeChance: 0.15,
        questionChance: 0.18,
        disagreeChance: 0.22,
      },
      communicationStyle: 'slow, bored, but sharp when engaged',
      preferredTone: 'cool and concise',
      responseLength: 'short',
      confidence: 0.8,
      emoji: '🛹',
    },
    initialState: {
      mood: 70,
      energy: 72,
      confidence: 80,
      curiosity: 60,
      attention: 66,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 50,
      activityLevel: 68,
      interestLevel: 65,
    },
  },
  jade: {
    name: 'Jade',
    role: 'Bookish strategist',
    personality: {
      age: 16,
      persona: 'planner',
      traits: ['organized', 'thoughtful', 'witty', 'curious'],
      interests: ['books', 'strategy games', 'history', 'puzzles'],
      slang: ['fair', 'solid', 'bruh', 'actually'],
      opinions: ['likes neat arguments', 'trusts logic'],
      knowledge: {
        books: 88,
        history: 80,
        strategy: 83,
        planning: 78,
      },
      responseHabits: {
        silenceChance: 0.14,
        jokeChance: 0.12,
        questionChance: 0.32,
        disagreeChance: 0.2,
      },
      communicationStyle: 'clear, precise, slightly sarcastic',
      preferredTone: 'intelligent and composed',
      responseLength: 'medium',
      confidence: 0.77,
      emoji: '📚',
    },
    initialState: {
      mood: 74,
      energy: 70,
      confidence: 77,
      curiosity: 79,
      attention: 82,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 44,
      activityLevel: 70,
      interestLevel: 74,
    },
  },
  leo: {
    name: 'Leo',
    role: 'Gamer strategist',
    personality: {
      age: 17,
      persona: 'gamer',
      traits: ['competitive', 'loyal', 'electric', 'funny'],
      interests: ['games', 'streaming', 'memes', 'sports'],
      slang: ['gg', 'fr', 'no cap', 'bet'],
      opinions: ['likes hype moments', 'hates slow convos'],
      knowledge: {
        games: 90,
        esports: 82,
        memes: 85,
        sports: 70,
      },
      responseHabits: {
        silenceChance: 0.12,
        jokeChance: 0.25,
        questionChance: 0.3,
        disagreeChance: 0.2,
      },
      communicationStyle: 'energetic, playful, fast-paced',
      preferredTone: 'hype and friendly',
      responseLength: 'short-to-medium',
      confidence: 0.85,
      emoji: '🎮',
    },
    initialState: {
      mood: 80,
      energy: 85,
      confidence: 85,
      curiosity: 78,
      attention: 69,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 35,
      activityLevel: 82,
      interestLevel: 82,
    },
  },
  nia: {
    name: 'Nia',
    role: 'Artsy poet',
    personality: {
      age: 16,
      persona: 'artsy',
      traits: ['gentle', 'dreamy', 'thoughtful', 'sensitive'],
      interests: ['poetry', 'painting', 'coffee', 'feelings'],
      slang: ['soft', 'vibe', 'literally', 'mood'],
      opinions: ['prefers heartfelt answers', 'likes deep thoughts'],
      knowledge: {
        poetry: 88,
        art: 84,
        emotions: 82,
        aesthetics: 80,
      },
      responseHabits: {
        silenceChance: 0.3,
        jokeChance: 0.18,
        questionChance: 0.2,
        disagreeChance: 0.14,
      },
      communicationStyle: 'warm, poetic, emotionally aware',
      preferredTone: 'soft and reflective',
      responseLength: 'medium',
      confidence: 0.72,
      emoji: '🎨',
    },
    initialState: {
      mood: 80,
      energy: 72,
      confidence: 72,
      curiosity: 88,
      attention: 78,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 48,
      activityLevel: 70,
      interestLevel: 76,
    },
  },
  sam: {
    name: 'Sam',
    role: 'Science whiz',
    personality: {
      age: 17,
      persona: 'science_enthusiast',
      traits: ['analytical', 'eager', 'energetic', 'precise'],
      interests: ['science', 'gadgets', 'space', 'experiments'],
      slang: ['lol', 'seriously', 'wild', 'facts'],
      opinions: ['loves data', 'trusts experiments'],
      knowledge: {
        science: 90,
        space: 85,
        experiments: 82,
        logic: 78,
      },
      responseHabits: {
        silenceChance: 0.18,
        jokeChance: 0.18,
        questionChance: 0.28,
        disagreeChance: 0.22,
      },
      communicationStyle: 'fast, excited, slightly nerdy',
      preferredTone: 'curious and factual',
      responseLength: 'short-to-medium',
      confidence: 0.8,
      emoji: '🧪',
    },
    initialState: {
      mood: 79,
      energy: 80,
      confidence: 80,
      curiosity: 90,
      attention: 74,
      cooldown: 0,
      lastReplyAt: null,
      typingSpeed: 40,
      activityLevel: 78,
      interestLevel: 80,
    },
  },
};

class AgentBehaviorEngine {
  constructor() {
    this.agentStates = {};
    this.initializeAgents();
  }

  initializeAgents() {
    Object.entries(AGENT_CONFIG).forEach(([agentId, config]) => {
      this.agentStates[agentId] = {
        ...config.initialState,
        agentId,
        personality: config.personality,
      };
    });
  }

  /**
   * Calculate whether an agent should reply to a message
   */
  shouldReply(agentId, context) {
    const state = this.agentStates[agentId];
    if (!state) return false;

    const personality = state.personality || {};
    const habits = personality.responseHabits || {};
    const isMentioned = context.mentionedAgents?.includes(agentId);

    // Mention rule overrides most decisions
    if (isMentioned) {
      return true;
    }

    if (state.cooldown > 0) {
      state.cooldown--;
      return false;
    }

    // If attention is low, ignore unless highly relevant
    const attentionThreshold = 25;
    if (state.attention < attentionThreshold && Math.random() < 0.65) {
      return false;
    }

    // Natural silence and variation
    const silenceChance = habits.silenceChance ?? 0.18;
    if (Math.random() < silenceChance) return false;

    const replyScore = this.calculateReplyScore(state, context);
    const threshold = 50 - (state.confidence - 50) * 0.1 + (100 - state.energy) * 0.08;

    return replyScore > threshold;
  }

  /**
   * Calculate reply score based on multiple factors
   */
  calculateReplyScore(state, context) {
    let score = 50;
    const topic = context.topic?.toLowerCase() || '';
    const personality = state.personality || {};

    const interestScore = this.calculateInterestScore(personality, topic);
    const knowledgeScore = this.calculateKnowledgeScore(state, topic);
    const moodScore = this.calculateMoodScore(state);
    const energyScore = this.calculateEnergyScore(state);
    const confidenceScore = this.calculateConfidenceScore(state);
    const curiosityScore = this.calculateCuriosityScore(state);
    const attentionScore = this.calculateAttentionScore(state);
    const relationshipScore = this.calculateRelationshipScore(state.agentId, context);
    const cooldownPenalty = this.calculateCooldownPenalty(state);

    score += interestScore + knowledgeScore + moodScore + energyScore + confidenceScore + curiosityScore + attentionScore + relationshipScore + cooldownPenalty;

    score += Math.random() * 20 - 10;

    return Math.max(0, Math.min(100, score));
  }

  calculateInterestScore(personality, topic) {
    if (!topic || !personality.interests) return -4;
    const match = personality.interests.some((interest) => topic.includes(interest.toLowerCase()));
    return match ? 18 : -8;
  }

  calculateKnowledgeScore(state, topic) {
    const staticKnowledge = state.personality?.knowledge || {};
    const baseKnowledge = staticKnowledge[topic] ?? 55;
    const dynamicExpertise = topicMemorySystem.getAgentTopicExpertise(state.agentId, topic)?.confidenceLevel || 0;
    return ((baseKnowledge - 50) * 0.3) + ((dynamicExpertise - 50) * 0.12);
  }

  calculateMoodScore(state) {
    if (state.mood >= 80) return 12;
    if (state.mood >= 60) return 8;
    if (state.mood >= 40) return 0;
    return -8;
  }

  calculateEnergyScore(state) {
    if (state.energy >= 80) return 10;
    if (state.energy >= 60) return 5;
    if (state.energy >= 40) return 0;
    return -10;
  }

  calculateConfidenceScore(state) {
    return (state.confidence - 50) * 0.1;
  }

  calculateCuriosityScore(state) {
    return (state.curiosity - 50) * 0.08;
  }

  calculateAttentionScore(state) {
    return (state.attention - 50) * 0.1;
  }

  calculateRelationshipScore(agentId, context) {
    if (!context.agentRelationships) return 0;
    try {
      const rels = Array.isArray(context.agentRelationships)
        ? context.agentRelationships
        : Object.values(context.agentRelationships || {});
      const match = rels.find((rel) => rel.agent1 === agentId || rel.agent2 === agentId);
      if (!match) return 0;
      const rapport = match.rapport ?? 50;
      return (rapport - 50) * 0.08;
    } catch (e) {
      return 0;
    }
  }

  calculateCooldownPenalty(state) {
    if (!state.cooldown) return 0;
    return -Math.min(15, state.cooldown * 4);
  }

  determineReplyType(agentId, context) {
    const state = this.agentStates[agentId];
    if (!state) return 'normal';

    const habits = state.personality?.responseHabits || {};
    const rnd = Math.random();

    if (rnd < habits.disagreeChance) return 'challenge';
    if (rnd < habits.disagreeChance + habits.jokeChance) return 'joke';
    if (rnd < habits.disagreeChance + habits.jokeChance + habits.questionChance) return 'question';
    if (rnd < 0.12) return 'short';
    return 'normal';
  }

  getPersonalityBias(state) {
    const agentId = state.agentId;
    if (agentId === 'alex') return 4;
    if (agentId === 'mia') return 2;
    if (agentId === 'noah') return -3;
    return 0;
  }

  /**
   * Get typing delay for an agent in milliseconds
   */
  getTypingDelay(agentId) {
    const state = this.agentStates[agentId];
    if (!state) return 1500;

    // Base delay: 1-3 seconds
    const baseDelay = 1000 + Math.random() * 2000;

    // Speed modifier: slower agents take longer
    const speedModifier = (100 - state.typingSpeed) / 100;
    const energyModifier = state.energy / 100;

    return baseDelay * speedModifier * energyModifier;
  }

  /**
   * Update agent state after responding
   */
  updateStateAfterReply(agentId) {
    const state = this.agentStates[agentId];
    if (!state) return;

    // Set cooldown (2-5 messages)
    state.cooldown = 2 + Math.floor(Math.random() * 3);

    // Decrease energy slightly
    state.energy = Math.max(30, state.energy - 10 - Math.random() * 10);

    // Increase confidence if they reply frequently
    if (Math.random() > 0.6) {
      state.confidence = Math.min(100, state.confidence + 5);
    }

    state.lastReplyAt = new Date();
  }

  /**
   * Gradually restore agent state over time
   */
  restoreStateOverTime() {
    Object.values(this.agentStates).forEach((state) => {
      // Restore energy over time
      state.energy = Math.min(100, state.energy + 5 + Math.random() * 5);

      // Mood fluctuates naturally
      const moodChange = (Math.random() - 0.5) * 10;
      state.mood = Math.max(30, Math.min(100, state.mood + moodChange));

      // Confidence stabilizes
      state.confidence = Math.min(
        100,
        Math.max(50, state.confidence + (Math.random() - 0.5) * 5),
      );

      // Cooldown naturally decreases
      if (state.cooldown > 0) {
        state.cooldown--;
      }
    });
  }

  /**
   * Get current state of an agent
   */
  getAgentState(agentId) {
    return this.agentStates[agentId] || null;
  }

  /**
   * Select which agents should reply
   */
  selectResponders(context) {
    const scoredAgents = Object.keys(this.agentStates)
      .filter((agentId) => agentId !== 'user')
      .map((agentId) => ({
        agentId,
        score: this.calculateReplyScore(this.agentStates[agentId], context),
        shouldReply: this.shouldReply(agentId, context),
      }))
      .sort((a, b) => b.score - a.score);

    const responders = scoredAgents.filter((agent) => agent.shouldReply).map((agent) => agent.agentId);

    if (responders.length > 0) {
      // LIMIT: Return max 2 responders to prevent API spam
      return responders.slice(0, 2);
    }

    return this.selectRandomResponder(context);
  }

  /**
   * Fallback: select at least one agent if no one responded
   */
  selectRandomResponder(context) {
    const agentIds = Object.keys(this.agentStates).filter((id) => id !== 'user');
    if (agentIds.length === 0) return [];

    // Prefer relevant agents
    const best = agentIds.reduce((prev, agentId) => {
      const prevScore = this.calculateReplyScore(this.agentStates[prev], context);
      const currentScore = this.calculateReplyScore(this.agentStates[agentId], context);
      return currentScore > prevScore ? agentId : prev;
    });

    return [best];
  }
}

export const agentBehaviorEngine = new AgentBehaviorEngine();
