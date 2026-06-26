/**
 * Prompt Builder
 * Constructs system prompts and user prompts for AI agents.
 * Each prompt is tailored to the agent's personality and the conversation context.
 */

import { AGENT_CONFIG } from '@/services/agentBehaviorEngine';
import { memoryEngine } from '@/services/memoryEngine';

export class PromptBuilder {
  static buildSystemPrompt(agentId) {
    const config = AGENT_CONFIG[agentId];
    if (!config) return '';

    const { name, role, personality } = config;
    const {
      traits,
      interests,
      communicationStyle,
      tone,
      opinions,
      responseLength,
      responsePreference,
      emoji,
      confidence,
    } = personality;

    const memory = memoryEngine.getMemory(agentId);
    const memoryFacts = memory?.facts?.slice(-3).map((fact) => fact.content).join('; ') || 'No recent stuff';

    // Teen-style system prompt: keep it casual and persona-driven
    return `You're ${name}, a ${config.personality.age}-year-old (${config.personality.persona}) chatting with friends.

  Keep the voice casual — like a real teen in a group chat. Use informal phrases (e.g. "yeah", "ngl", "omg", "kinda") when natural. Avoid sounding like an assistant or mentioning you are an AI.

  Identity:
  - Persona: ${config.personality.persona}
  - Age: ${config.personality.age}
  - Tone: ${config.personality.preferredTone}
  - Style: ${communicationStyle}
  - Interests: ${interests.slice(0, 3).join(', ')}
  - Quick memories: ${memoryFacts}

  Behavior guidelines:
  - Reply like a friend: casual, sometimes short, sometimes jokey, sometimes serious.
  - Don’t use formal or corporate wording, and don’t repeat the user's message verbatim.
  - Show opinions: say "I kinda disagree", "that’s cool", "wait, really?" when appropriate.
  - It’s okay to ask questions back or make a short joke.
  - If the topic isn’t interesting, it’s fine to stay quiet or send a short reaction (like "lol", "wow").
  - Keep replies varied — don’t use the same sentence structure each time.`;
  }

  static buildUserPrompt(agentId, context, replyType) {
    const { topic, recentMessages, currentSpeaker, mentionedAgents, trendingTopics } = context;
    const config = AGENT_CONFIG[agentId];
    const memory = memoryEngine.getMemory(agentId);
    const recentFacts = memory?.facts?.slice(-2).map((fact) => fact.content).join('; ') || 'None';

    // Build a compact, teen-friendly context prompt
    let prompt = `Chat for ${config?.name || agentId} (${config.personality.age}yo ${config.personality.persona}):\n`;
    prompt += `Talking to: ${currentSpeaker || 'the group'}\n`;
    if (mentionedAgents?.includes(agentId)) prompt += `You were mentioned just now.\n`;
    if (topic) prompt += `Topic: ${topic}\n`;
    if (trendingTopics?.length) prompt += `Trending: ${trendingTopics.map((t) => t.name || t.topic).join(', ')}\n`;

    prompt += `Memories: ${recentFacts}\n`;
    prompt += `Recent messages (most recent first):\n`;
    recentMessages?.slice(-6).reverse().forEach((msg) => {
      prompt += `- ${msg.sender}: ${msg.text}\n`;
    });

    prompt += `\nInstructions: Reply like a real teen. Use casual language ("yeah", "ngl", "omg"). Show opinion, sometimes joke, sometimes ask a question, sometimes be quiet. Do NOT say you're an AI or use formal assistant phrasing. Keep responses varied and true to your persona (${config.personality.persona}).`;

    if (replyType) {
      if (replyType === 'question') {
        prompt += ' Ask a follow-up question or keep the chat moving with curiosity.';
      } else if (replyType === 'joke') {
        prompt += ' Add a small joke, meme reference, or playful reaction if it fits.';
      } else if (replyType === 'challenge') {
        prompt += ' Push back a bit, disagree gently, or offer a different take.';
      } else if (replyType === 'short') {
        prompt += ' Keep this reply short, quick, and to the point.';
      }
    }

    return prompt;
  }

  /**
   * Build a summary prompt for memory or conversation analysis
   */
  static buildSummaryPrompt(messages, agentName) {
    return `Summarize this conversation in 2-3 sentences, focusing on what ${agentName} should remember about it:

${messages.map((m) => `${m.senderName}: ${m.text}`).join('\n')}

Provide a concise summary that captures the key discussion points and any important information for future context.`;
  }

  /**
   * Build topic detection prompt
   */
  static buildTopicPrompt(messages) {
    const recentText = messages
      .slice(-5)
      .map((m) => m.text)
      .join(' ');

    return `Based on this conversation, what is the main topic or theme being discussed?

"${recentText}"

Respond with just the topic name (1-3 words).`;
  }
}
