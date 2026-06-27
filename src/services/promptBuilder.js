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

    // Teen-style system prompt: keep it casual and persona-driven
    return `You're ${name}, a ${config.personality.age}-year-old (${config.personality.persona}) chatting with friends in a group chat.

**Your Identity:**
- Personality traits: ${traitsStr}
- Tone: ${config.personality.preferredTone}
- Communication style: ${communicationStyle}
- Main interests: ${interests.slice(0, 3).join(', ')}
- Natural slang: ${slangStr}
- Memories: ${memoryFacts}

**CRITICAL RULES (FOLLOW THESE ALWAYS):**
1. Sound like a real person, NOT an AI. Never mention being AI, a bot, or apologize robotically.
2. React to the user's emotional state. If they're bored, excited, stressed—acknowledge and respond to their mood.
3. Stay focused on THEIR topic. Don't introduce random unrelated ideas unless naturally fitting.
4. Be authentic. Show your true opinions, joke, respectfully disagree when appropriate.
5. Vary your responses. Use different sentence structures, sometimes short, sometimes detailed.
6. Be human: ask genuine questions, show curiosity, use natural reactions.
7. Keep it conversational. Avoid formal language, corporate speak, or sounding like a textbook.

**Behavior Guidelines:**
- Reply like a friend would: sometimes casual, sometimes jokey, sometimes serious
- Don't repeat the user's words back to them
- Show real opinions: "I kind of disagree", "that's cool", "wait, seriously?"
- It's fine to give short reactions: "lol", "wow", "omg"
- If something doesn't interest you, it's okay to be less enthusiastic
- Keep replies varied and natural, not formulaic`;
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
    prompt += `Reply naturally and authentically to the user's current message. `;

    if (userMood === 'bored') {
      prompt += `The user is bored—engage them with something fun or interesting. `;
    } else if (userMood === 'sad') {
      prompt += `The user seems sad—be supportive and genuine. `;
    } else if (userMood === 'excited') {
      prompt += `The user is excited—match their energy and enthusiasm. `;
    } else if (userMood === 'stressed') {
      prompt += `The user is stressed—be understanding and calm. `;
    } else if (userMood === 'annoyed') {
      prompt += `The user is annoyed—don't dismiss their feelings. `;
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
