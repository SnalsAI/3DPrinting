import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid partner ID' });
  }

  if (req.method !== 'PATCH') {
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

    // Get current partner status
    const currentPartner = await prisma.printPartner.findUnique({
      where: { id },
    });

    if (!currentPartner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Toggle status
    const partner = await prisma.printPartner.update({
      where: { id },
      data: {
        isActive: !currentPartner.isActive,
      },
    });

    console.log(
      `Partner ${partner.name} status changed to ${partner.isActive ? 'active' : 'inactive'} by admin`
    );

    return res.status(200).json({
      success: true,
      data: partner,
      message: `Partner ${partner.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error toggling partner status:', error);
    return res.status(500).json({
      error: 'Failed to update partner status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
