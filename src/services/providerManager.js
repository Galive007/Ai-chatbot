/**
 * Provider Manager
 * Abstraction layer for AI providers (Gemini, Groq, etc.)
 * Handles provider selection, request/response management, and error handling
 */

const PROVIDERS = {
  GEMINI: 'gemini',
  GROQ: 'groq',
};

const DEFAULT_PROVIDER = process.env.NEXT_PUBLIC_AI_PROVIDER || PROVIDERS.GEMINI;

function createFetchWithTimeout(timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    controller,
    clear: () => clearTimeout(timeoutId),
  };
}

function buildContextualReply(payload) {
  const promptText = payload?.prompt || '';
  const systemText = payload?.systemPrompt || '';
  const topicMatch = promptText.match(/Topic:\s*(.+)/i);
  const topic = topicMatch?.[1]?.trim() || 'this discussion';
  const lowerPrompt = promptText.toLowerCase();
  const isMentioned = /mentioned|explicitly mentioned/i.test(promptText);

  // Detect persona from system prompt cues
  let persona = null;
  const personaMatch = systemText.match(/persona:\s*(\w+)/i) || systemText.match(/(tech_nerd|debater|creative)/i);
  if (personaMatch) persona = (personaMatch[1] || personaMatch[0]).toLowerCase();

  const hasStudySignals = /study|learn|homework|note|practice|exam/i.test(lowerPrompt);
  const hasCreativeSignals = /creative|design|story|idea|imagine|vibe|meme/i.test(lowerPrompt);
  const hasTechnicalSignals = /physics|math|astronomy|chemistry|biology|equation|code|program|algorithm/i.test(lowerPrompt);

  // Base replies follow teen tone: casual, opinionated, short or playful
  let response;
  if (isMentioned) {
    response = `Oh hey, about ${topic} — hmm, ${Math.random() > 0.5 ? "I think" : "ngl"} we could try a quick example to make it clear.`;
  } else if (hasStudySignals) {
    response = `TBH, for ${topic} I'd split it into 2 steps and start with the easiest one.`;
  } else if (hasCreativeSignals) {
    response = `That actually sparks an idea — imagine ${topic} as a story where...`;
  } else if (hasTechnicalSignals) {
    response = `Okay, quick take on ${topic}: check the main assumption first, then test it with a tiny example.`;
  } else {
    response = `Hmm, ${topic} sounds interesting. Maybe ask a clearer question or drop an example?`;
  }

  // Persona-based flavor
  if (persona?.includes('tech')) {
    if (Math.random() < 0.25) response = `lol ${response}`;
    response = response.replace(/^/, "ngl, ");
  } else if (persona?.includes('debater')) {
    if (Math.random() < 0.4) response = `I kinda disagree — ${response.toLowerCase()}`;
    response = response + ' (not tryna be rude tho)';
  } else if (persona?.includes('creative')) {
    if (Math.random() < 0.5) response = `omg ${response}`;
    response = response + ' ✨';
  }

  // Keep it short sometimes
  if (Math.random() < 0.2) {
    const shortVariants = ["lol yeah", "true", "huh", "nice", "omg"];
    response = shortVariants[Math.floor(Math.random() * shortVariants.length)];
  }

  // Ensure no AI/meta phrases
  response = response.replace(/\bAI\b|artificial intelligence|assistant/gi, '');

  return response;
}

class GeminiProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-1.5-flash';
  }

  async generateReply(payload) {
    if (!this.apiKey) {
      return this.generateLocalReply(payload);
    }

    try {
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

      const generationConfig = payload.generationConfig || {};
      const { controller, clear } = createFetchWithTimeout(10000);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: payload.prompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: payload.systemPrompt }],
          },
          generationConfig: {
            temperature: generationConfig.temperature ?? 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: generationConfig.maxTokens ?? 150,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      clear();
      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand.';

      return {
        success: true,
        text: text.trim(),
        finishReason: data.candidates?.[0]?.finishReason,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        },
        provider: PROVIDERS.GEMINI,
        model: this.model,
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error?.message || 'Gemini API request failed',
        provider: PROVIDERS.GEMINI,
        model: this.model,
      };
    }
  }

  generateLocalReply(payload) {
    return {
      success: true,
      text: buildContextualReply(payload),
      finishReason: 'STOP',
      usage: { inputTokens: 0, outputTokens: 0 },
      provider: 'local',
      model: this.model,
    };
  }
}

class GroqProvider {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile';
  }

  async generateReply(payload) {
    if (!this.apiKey) {
      return this.generateLocalReply(payload);
    }

    try {
      const generationConfig = payload.generationConfig || {};
      const { controller, clear } = createFetchWithTimeout(10000);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: payload.systemPrompt,
            },
            {
              role: 'user',
              content: payload.prompt,
            },
          ],
          temperature: generationConfig.temperature ?? 0.7,
          max_tokens: generationConfig.maxTokens ?? 150,
          top_p: 0.95,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error?.message || errorData?.message || response.statusText || 'Unknown Groq API error';
        throw new Error(`Groq API error: ${response.status} - ${errorMessage}`);
      }

      clear();
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'I understand.';

      return {
        success: true,
        text: text.trim(),
        finishReason: data.choices?.[0]?.finish_reason,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
        provider: PROVIDERS.GROQ,
        model: this.model,
      };
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        success: false,
        error: error?.message || 'Groq API request failed',
        provider: PROVIDERS.GROQ,
        model: this.model,
      };
    }
  }

  generateLocalReply(payload) {
    return {
      success: true,
      text: buildContextualReply(payload),
      finishReason: 'STOP',
      usage: { inputTokens: 0, outputTokens: 0 },
      provider: 'local',
      model: this.model,
    };
  }
}

class ProviderManager {
  constructor() {
    this.providers = {
      [PROVIDERS.GEMINI]: new GeminiProvider(),
      [PROVIDERS.GROQ]: new GroqProvider(),
    };
    this.activeProvider = DEFAULT_PROVIDER;
  }

  /**
   * Generate a reply using the active provider
   */
  async generateReply(payload, provider = this.activeProvider) {
    const providerInstance = this.providers[provider];
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }

    // Validate payload
    if (!payload.prompt || !payload.systemPrompt) {
      throw new Error('Prompt and systemPrompt are required');
    }

    const result = await providerInstance.generateReply(payload);
    if (!result.success) {
      return {
        success: false,
        error: result.error || `Provider ${provider} failed to generate a response`,
        provider: result.provider || provider,
        model: result.model || providerInstance.model,
      };
    }

    return result;
  }

  /**
   * Set the active provider
   */
  setProvider(provider) {
    if (!this.providers[provider]) {
      throw new Error(`Provider ${provider} not found`);
    }
    this.activeProvider = provider;
  }

  /**
   * Get the active provider name
   */
  getActiveProvider() {
    return this.activeProvider;
  }

  /**
   * Health check for a provider
   */
  async healthCheck(provider = this.activeProvider) {
    try {
      const result = await this.generateReply(
        {
          systemPrompt: 'You are a helpful assistant.',
          prompt: 'Respond with just OK',
        },
        provider,
      );

      return {
        provider,
        healthy: result.success,
        message: result.success ? 'Provider is healthy' : 'Provider returned invalid response',
      };
    } catch (error) {
      return {
        provider,
        healthy: false,
        message: error.message,
      };
    }
  }

  /**
   * List available providers
   */
  listProviders() {
    return Object.keys(this.providers);
  }
}

export const providerManager = new ProviderManager();
export const PROVIDER_TYPES = PROVIDERS;
