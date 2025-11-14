import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyApiKey } from '@/lib/middleware/checkApiKey';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify API key
    const verification = await verifyApiKey(req, res);
    if (!verification.valid) {
      return res.status(401).json({ error: verification.error });
    }

    // Fetch all active models
    const models = await prisma.model3D.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        previewImageUrl: true,
        availableMaterials: true,
        maxColors: true,
        basePrice: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: models,
      count: models.length,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(500).json({
      error: 'Failed to fetch models',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
