import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { MaterialType } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search, material, maxColors } = req.query;

    // Build filter object
    const where: any = {
      isActive: true, // Only show active models
    };

    // Search filter
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Material filter
    if (material && typeof material === 'string') {
      where.availableMaterials = {
        has: material as MaterialType,
      };
    }

    // Max colors filter
    if (maxColors && typeof maxColors === 'string') {
      const colors = parseInt(maxColors);
      if (!isNaN(colors)) {
        where.maxColors = {
          gte: colors,
        };
      }
    }

    // Fetch public models
    const models = await prisma.model3D.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            customizations: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return res.status(200).json({
      success: true,
      data: models,
      count: models.length,
    });
  } catch (error) {
    console.error('Error fetching public models:', error);
    return res.status(500).json({
      error: 'Failed to fetch models',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
