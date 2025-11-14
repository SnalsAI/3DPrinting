import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const { modelId, parameters, logoFileUrl, aiSuggestion } = req.body;

    // Validation
    if (!modelId || !parameters) {
      return res.status(400).json({
        error: 'Missing required fields: modelId, parameters'
      });
    }

    // Verify model exists
    const model = await prisma.model3D.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Create customization
    const customization = await prisma.customization.create({
      data: {
        modelId,
        userId: (session.user as any).id,
        parameters,
        logoFileUrl: logoFileUrl || null,
        aiSuggestion: aiSuggestion || null,
      },
      include: {
        model: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: customization,
    });
  } catch (error) {
    console.error('Error creating customization:', error);
    return res.status(500).json({
      error: 'Failed to create customization',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
