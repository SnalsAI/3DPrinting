import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getRecommendedModels } from '@/lib/recommendations/engine';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 8;

    // Get recommended models
    const recommendations = await getRecommendedModels(
      (session.user as any).id,
      limitNum
    );

    return res.status(200).json({
      success: true,
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({
      error: 'Failed to fetch recommendations',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
