/**
 * Conversation utilities
 * Topic detection, mention detection, and conversation analysis
 */

import { participants } from '@/constants/chatData';

/**
 * Parse topics from message text
 */
export function parseTopics(text) {
  const topics = [
    'physics',
    'motion',
    'velocity',
    'acceleration',
    'forces',
    'newton',
    'math',
    'calculus',
    'derivatives',
    'integration',
    'algebra',
    'geometry',
    'astronomy',
    'exam',
    'homework',
    'problem',
    'diagram',
    'curve',
    'shm',
    'simple harmonic motion',
  ];

  const lowerText = text.toLowerCase();
  for (const topic of topics) {
    if (lowerText.includes(topic)) {
      return topic;
    }
  }

  // Return a generic topic if no specific one found
  return 'discussion';
}

/**
 * Detect mentioned agents in a message
 */
export function detectMentions(text) {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const mention = match[1].toLowerCase();
    const participant = participants.find(
      (p) => p.name.toLowerCase() === mention || p.id.toLowerCase() === mention,
    );
    if (participant) {
      mentions.push(participant.id);
    }
  }

  return mentions;
}

/**
 * Extract conversation summary
 */
export function extractConversationSummary(messages, limit = 5) {
  return messages.slice(-limit).map((m) => ({
    sender: m.senderName,
    text: m.text,
    timestamp: m.createdAt,
  }));
}

/**
 * Detect if conversation is becoming off-topic
 */
export function detectOffTopic(messages) {
  if (messages.length < 3) return false;

  const recentMessages = messages.slice(-5);
  const topics = recentMessages.map((m) => parseTopics(m.text));
  const uniqueTopics = new Set(topics);

  return uniqueTopics.size > 3;
}

/**
 * Calculate conversation momentum (how active is the chat)
 */
export function calculateMomentum(messages) {
  if (messages.length < 2) return 0;

  const recentMessages = messages.slice(-10);
  const timeSpan = new Date(recentMessages[recentMessages.length - 1].createdAt) -
    new Date(recentMessages[0].createdAt);

  // Messages per minute
  const momentum = (recentMessages.length / (timeSpan / (1000 * 60))) * 100;

  return Math.min(100, momentum);
}

/**
 * Get dominant speaker
 */
export function getDominantSpeaker(messages) {
  const speakerCount = {};

  messages.forEach((m) => {
    speakerCount[m.senderName] = (speakerCount[m.senderName] || 0) + 1;
  });

  return Object.entries(speakerCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

/**
 * Detect user's emotional mood from message text
 */
export function detectUserMood(text) {
  const lowerText = text.toLowerCase();

  const MOOD_PATTERNS = {
    bored: /bored|tired|nothing|dull|blah|meh|ugh/i,
    sad: /sad|depressed|upset|down|awful|terrible|hate|worst/i,
    excited: /excited|amazing|awesome|omg|wow|yay|yes|love|incredible/i,
    stressed: /stressed|overwhelmed|panicking|panic|anxiety|anxious|worried|nervous/i,
    annoyed: /annoyed|frustrated|irritated|angry|mad|pissed|irritating/i,
    calm: /calm|chill|relaxed|cool|peaceful|fine/i,
  };

  for (const [mood, pattern] of Object.entries(MOOD_PATTERNS)) {
    if (pattern.test(lowerText)) {
      return mood;
    }
  }

  return 'neutral';
}

/**
 * Detect user's intent from message text
 */
export function detectUserIntent(text) {
  const lowerText = text.toLowerCase();

  // Project sharing intent
  if (/made|built|created|finished|completed|done with|just finished/i.test(text)) {
    return 'share_project';
  }

  // Fun seeking intent
  if (/boring|bored|play|game|fun|do something|let's/i.test(text)) {
    return 'seek_fun';
  }

  // Help seeking intent
  if (/help|how|why|what|confused|stuck|don't understand|explain/i.test(text)) {
    return 'ask_help';
  }

  // Opinion seeking intent
  if (/think|opinion|thoughts|should|advice|what do you/i.test(text)) {
    return 'seek_opinion';
  }

  // Generic chat
  return 'chat';
}

/**
 * Infer conversation goal from user's mood and context
 */
export function inferConversationGoal(text, mood) {
  if (mood === 'bored') {
    return 'Cheer up the group and suggest something more fun.';
  }
  if (mood === 'sad') {
    return 'Be supportive and understanding; offer comfort.';
  }
  if (mood === 'excited') {
    return 'Match the energy and celebrate with them.';
  }
  if (mood === 'stressed') {
    return 'Be calm and practical; help reduce stress.';
  }
  if (mood === 'annoyed') {
    return 'Validate their feelings without escalating.';
  }

  // Default based on intent
  if (/made|built|created/i.test(text)) {
    return 'Show genuine interest in what they made.';
  }
  if (/help|stuck|confused/i.test(text)) {
    return 'Provide useful guidance and support.';
  }

  return 'Continue natural group conversation.';
}
