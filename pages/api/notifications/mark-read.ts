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

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Missing or invalid ids array' });
    }

    // Mark notifications as read (only user's own notifications)
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId: (session.user as any).id, // Security: only update own notifications
      },
      data: {
        read: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({
      error: 'Failed to mark notifications as read',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
