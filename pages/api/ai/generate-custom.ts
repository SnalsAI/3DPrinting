import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAIProvider, AIProvider } from '@/lib/ai/providers';
import { sanitizeString } from '@/utils/helpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication (optional - can be public)
    const session = await getServerSession(req, res, authOptions);

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

    // Generate customization suggestion
    const suggestion = await aiProvider.generateCustomization(sanitizedPrompt);

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
    console.error('Error generating AI customization:', error);
    return res.status(500).json({
      error: 'Failed to generate customization',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
