import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
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
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, location, supportedMaterials, maxColors } = req.body;

    // Validation
    if (!name || !email || !location || !supportedMaterials || !maxColors) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!Array.isArray(supportedMaterials) || supportedMaterials.length === 0) {
      return res.status(400).json({
        error: 'At least one supported material is required',
      });
    }

    // Validate materials
    const validMaterials = Object.values(MaterialType);
    for (const material of supportedMaterials) {
      if (!validMaterials.includes(material)) {
        return res.status(400).json({ error: `Invalid material: ${material}` });
      }
    }

    // Check if email already exists
    const existingPartner = await prisma.printPartner.findUnique({
      where: { email },
    });

    if (existingPartner) {
      return res.status(400).json({
        error: 'A partner with this email already exists',
      });
    }

    // Create partner
    const partner = await prisma.printPartner.create({
      data: {
        name,
        email,
        location,
        supportedMaterials,
        maxColors: parseInt(maxColors),
        isActive: true,
      },
    });

    console.log(`Print partner ${name} created by admin`);

    return res.status(201).json({
      success: true,
      data: partner,
      message: 'Partner created successfully',
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    return res.status(500).json({
      error: 'Failed to create partner',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
