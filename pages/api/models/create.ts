import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { MaterialType } from '@prisma/client';

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

    if (!session || (session.user as any).role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const {
      name,
      description,
      fileUrl,
      previewImageUrl,
      availableMaterials,
      maxColors,
      basePrice,
    } = req.body;

    // Validation
    if (!name || !description || !fileUrl) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, fileUrl'
      });
    }

    // Create model in database
    const model = await prisma.model3D.create({
      data: {
        name,
        description,
        fileUrl,
        previewImageUrl: previewImageUrl || null,
        availableMaterials: availableMaterials || [MaterialType.PLA],
        maxColors: parseInt(maxColors) || 1,
        basePrice: parseFloat(basePrice) || 0,
        isActive: true,
        createdById: (session.user as any).id,
      },
      include: {
        createdBy: {
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
      data: model,
    });
  } catch (error) {
    console.error('Error creating model:', error);
    return res.status(500).json({
      error: 'Failed to create model',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
