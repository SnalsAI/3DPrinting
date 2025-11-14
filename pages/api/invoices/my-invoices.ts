import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

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

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user's invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        order: {
          userId: user.id,
        },
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            totalAmount: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({
      error: 'Failed to fetch invoices',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
