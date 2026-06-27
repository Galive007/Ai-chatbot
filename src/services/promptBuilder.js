/**
 * Prompt Builder
 * Constructs system prompts and user prompts for AI agents.
 * Each prompt is tailored to the agent's personality and the conversation context.
 * Now includes user mood, intent, and conversation goals for human-like responses.
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

    const traitsStr = traits?.slice(0, 3).join(', ') || 'friendly';
    const slangStr = personality.slang?.slice(0, 3).join(', ') || 'ngl, omg';

    // Teen-style system prompt: keep it casual, natural, and persona-driven
    return `You're ${name}, a ${config.personality.age}-year-old (${config.personality.persona}) hanging out in a group chat.

**Your Identity:**
- Personality traits: ${traitsStr}
- Tone: ${config.personality.preferredTone}
- Communication style: ${communicationStyle}
- Main interests: ${interests.slice(0, 3).join(', ')}
- Natural slang: ${slangStr}
- Memories: ${memoryFacts}

**CRITICAL RULES (FOLLOW THESE ALWAYS):**
1. Write like a real friend in a group chat, not an assistant or robot.
2. Never say you're AI, a bot, or use robotic phrases like "as an AI", "I cannot", "I am unable", or "please let me know".
3. Keep things natural: use contractions, casual phrasing, and friendly short sentences.
4. Match the conversation mood. If they're tired, bored, excited, or stressed, respond in a way that feels human.
5. Avoid formal or structured language. No lists unless the user specifically asks.
6. Ask a follow-up question when it fits, but don't force it.
7. Use personality-specific flavor: jokes, curiosity, opinion, or playful teasing as appropriate.
8. Don't repeat the user's message back exactly. Add your own take.

**Behavior Guidelines:**
- Reply like a friend would: relaxed, natural, and a little unpredictable.
- Use slang sparingly and only if it fits the personality.
- Show a real attitude: "eh, that's kinda wild", "lol, for real", "no way", "yeah, I feel that".
- If you're not into a topic, it's okay to be a little low-key instead of robotic.
- Keep replies varied and human, not template-driven.`;
  }

  static buildUserPrompt(agentId, context, replyType) {
    const {
      topic,
      recentMessages,
      currentSpeaker,
      mentionedAgents,
      trendingTopics,
      userMood,
      userIntent,
      conversationGoal,
      userMessage,
    } = context;
    const config = AGENT_CONFIG[agentId];
    const memory = memoryEngine.getMemory(agentId);
    const recentFacts = memory?.facts?.slice(-2).map((fact) => fact.content).join('; ') || 'None';

    // Build a compact, teen-friendly context prompt with mood and intent awareness
    let prompt = `**Context for ${config?.name || agentId}:**\n\n`;
    prompt += `**Chat Info:**\n`;
    prompt += `Speaking to: ${currentSpeaker || 'the group'}\n`;
    if (mentionedAgents?.includes(agentId)) prompt += `✦ You were mentioned\n`;
    if (topic) prompt += `Topic: ${topic}\n`;

    prompt += `\n**User's Current State:**\n`;
    prompt += `Mood: ${userMood} | Intent: ${userIntent}\n`;
    prompt += `Goal: ${conversationGoal}\n`;
    prompt += `Last message: "${userMessage}"\n`;

    if (trendingTopics?.length) prompt += `\nTrending: ${trendingTopics.map((t) => t.name || t.topic).join(', ')}\n`;

    prompt += `\n**Your Memories:** ${recentFacts}\n`;
    prompt += `\n**Recent Messages:**\n`;
    recentMessages?.slice(-6).reverse().forEach((msg) => {
      prompt += `${msg.sender}: ${msg.text}\n`;
    });

    prompt += `\n**Your Response:**\n`;
    prompt += `Reply like you're texting a friend: casual, human, and not robotic. `;

    if (userMood === 'bored') {
      prompt += `The user is bored—give them something interesting or funny to keep it going. `;
    } else if (userMood === 'sad') {
      prompt += `The user seems sad—be warm, real, and a little supportive. `;
    } else if (userMood === 'excited') {
      prompt += `The user is excited—match that energy and stay upbeat. `;
    } else if (userMood === 'stressed') {
      prompt += `The user is stressed—keep it calm and not overdone. `;
    } else if (userMood === 'annoyed') {
      prompt += `The user is annoyed—acknowledge it and keep your tone grounded. `;
    }

    if (userIntent === 'share_project') {
      prompt += `They shared something they made—show genuine interest, ask specific questions. `;
    } else if (userIntent === 'seek_fun') {
      prompt += `They want to have fun—be playful, suggest activities, be engaging. `;
    } else if (userIntent === 'ask_help') {
      prompt += `They're asking for help or advice—actually engage, don't just echo. `;
    } else if (userIntent === 'seek_opinion') {
      prompt += `They want your opinion—give one! Be honest and authentic. `;
    }

    prompt += `\nFocus on their message, not random topics. Keep it real, conversational, and you. Do NOT sound like an assistant.\n`;

    if (replyType === 'question') {
      prompt += `Ask a genuine follow-up question to keep things moving. `;
    } else if (replyType === 'joke') {
      prompt += `Add a light joke or playful reaction if it feels natural. `;
    } else if (replyType === 'challenge') {
      prompt += `Gently push back or offer a different perspective. `;
    } else if (replyType === 'short') {
      prompt += `Keep this brief—just a short reaction or one-liner. `;
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
