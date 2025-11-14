import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { PrintStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    const { status } = req.query;

    // Build filter object
    const where: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as PrintStatus;
    }

    // Fetch print jobs
    const printJobs = await prisma.printJob.findMany({
      where,
      include: {
        partner: true,
        orderItem: {
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            customization: {
              include: {
                model: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: printJobs,
      count: printJobs.length,
    });
  } catch (error) {
    console.error('Error fetching print jobs:', error);
    return res.status(500).json({
      error: 'Failed to fetch print jobs',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
