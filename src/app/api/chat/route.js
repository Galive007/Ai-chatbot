import { providerManager } from '@/services/providerManager';
import { PromptBuilder } from '@/services/promptBuilder';
import { apiRateLimiter } from '@/services/rateLimiter';
import { errorHandler, AppError, ERROR_TYPES } from '@/services/errorHandler';

export async function POST(req) {
  try {
    // Check rate limit
    if (!apiRateLimiter.isAllowed()) {
      const waitTime = apiRateLimiter.getWaitTime();
      return Response.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(waitTime / 1000),
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { agentId, context, agentConfig, systemPrompt: incomingSystemPrompt, userPrompt: incomingUserPrompt, generationConfig } = body;

    if (!agentId || !agentConfig) {
      const error = new AppError('Missing agentId or agentConfig', ERROR_TYPES.VALIDATION_ERROR, {
        received: { agentId, agentConfig },
      });
      errorHandler.handle(error);

      return Response.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    // Build prompts using the agent's personality
    const systemPrompt = incomingSystemPrompt || PromptBuilder.buildSystemPrompt(agentId);
    const userPrompt = incomingUserPrompt || PromptBuilder.buildUserPrompt(agentId, context);

    // Generate response using the active provider
    const result = await providerManager.generateReply({
      systemPrompt,
      prompt: userPrompt,
      generationConfig,
    });

    if (!result.success) {
      const error = new AppError('Provider failed to generate response', ERROR_TYPES.API_ERROR, {
        provider: result.provider,
        providerError: result.error,
      });
      errorHandler.handle(error);

      return Response.json(
        {
          success: false,
          error: result.error || 'Failed to generate response',
          provider: result.provider,
        },
        { status: 502 },
      );
    }

    return Response.json({
      success: true,
      result: {
        text: result.text,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
      },
    });
  } catch (error) {
    const appError = errorHandler.handle(error, { endpoint: '/api/chat' });

    return Response.json(
      { success: false, error: appError.message },
      { status: 500 },
    );
  }
}

