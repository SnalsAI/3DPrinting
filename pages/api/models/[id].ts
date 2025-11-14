import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid model ID' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    // DELETE - Delete model
    if (req.method === 'DELETE') {
      // Check if model exists
      const model = await prisma.model3D.findUnique({
        where: { id },
      });

      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      // Delete model (cascade will handle related records)
      await prisma.model3D.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: 'Model deleted successfully',
      });
    }

    // GET - Get single model
    if (req.method === 'GET') {
      const model = await prisma.model3D.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          customizations: {
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      return res.status(200).json({
        success: true,
        data: model,
      });
    }

    // PUT/PATCH - Update model
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const {
        name,
        description,
        fileUrl,
        previewImageUrl,
        availableMaterials,
        maxColors,
        basePrice,
        isActive,
      } = req.body;

      const updateData: any = {};

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
      if (previewImageUrl !== undefined) updateData.previewImageUrl = previewImageUrl;
      if (availableMaterials !== undefined) updateData.availableMaterials = availableMaterials;
      if (maxColors !== undefined) updateData.maxColors = parseInt(maxColors);
      if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedModel = await prisma.model3D.update({
        where: { id },
        data: updateData,
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

      return res.status(200).json({
        success: true,
        data: updatedModel,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling model request:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
