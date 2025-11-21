import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAIProvider, AIProvider } from '@/lib/ai/providers';
import { sanitizeString } from '@/utils/helpers';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const timer = logger.startTimer('ai-generate-custom');

  if (req.method !== 'POST') {
    logger.warn('API', 'POST /api/ai/generate-custom', 'Method not allowed', {
      metadata: { method: req.method },
    });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication (optional - can be public)
    const session = await getServerSession(req, res, authOptions);
    const userId = (session?.user as any)?.id;

    logger.apiRequest('POST', '/api/ai/generate-custom', userId, {
      hasPrompt: !!req.body?.prompt,
      modelId: req.body?.modelId,
    });

    const { prompt, modelId, provider } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt'
      });
    }

    // Sanitize and validate prompt length
    const sanitizedPrompt = sanitizeString(prompt, 200);

    if (sanitizedPrompt.length < 3) {
      return res.status(400).json({
        error: 'Prompt too short. Please provide more details.'
      });
    }

    // Get AI provider (configurable)
    const aiProvider = getAIProvider({
      provider: provider || (process.env.AI_PROVIDER as AIProvider) || AIProvider.MOCK,
    });

    const aiProviderName = provider || process.env.AI_PROVIDER || AIProvider.MOCK;
    logger.aiRequest('Generate Customization', `Generating customization with ${aiProviderName}`, undefined, {
      provider: aiProviderName,
      promptLength: sanitizedPrompt.length,
      modelId,
    });

    // Generate customization suggestion
    const aiTimer = logger.startTimer('ai-generation');
    const suggestion = await aiProvider.generateCustomization(sanitizedPrompt);
    const aiDuration = aiTimer();

    logger.aiRequest('AI Response Received', `AI customization generated in ${aiDuration}ms`, aiDuration, {
      provider: aiProviderName,
      color: suggestion.color,
      material: suggestion.material,
    });

    const duration = timer();
    logger.apiResponse('POST', '/api/ai/generate-custom', 200, duration, userId);

    return res.status(200).json({
      success: true,
      data: {
        color: suggestion.color,
        text: suggestion.text,
        material: suggestion.material,
        prompt: sanitizedPrompt,
      },
    });
  } catch (error) {
    const duration = timer();
    const userId = (await getServerSession(req, res, authOptions))?.user?.id;

    logger.aiError('Generate Customization', 'Failed to generate AI customization', error as Error, {
      prompt: req.body?.prompt,
      provider: req.body?.provider,
    });

    console.error('Error generating AI customization:', error);
    return res.status(500).json({
      error: 'Failed to generate customization',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
