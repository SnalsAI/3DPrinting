import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { PrintStatus, OrderStatus } from '@prisma/client';

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

    // Fetch dashboard statistics
    const [
      totalOrders,
      revenueData,
      activeModels,
      activePrintJobs,
      totalUsers,
      printPartners,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Total revenue (sum of paid orders)
      prisma.order.aggregate({
        where: {
          status: {
            in: [
              OrderStatus.PAID,
              OrderStatus.SCHEDULED,
              OrderStatus.PRINTING,
              OrderStatus.SHIPPED,
              OrderStatus.DELIVERED,
            ],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Active models
      prisma.model3D.count({
        where: { isActive: true },
      }),

      // Active print jobs (scheduled or printing)
      prisma.printJob.count({
        where: {
          status: {
            in: [PrintStatus.SCHEDULED, PrintStatus.PRINTING],
          },
        },
      }),

      // Total users
      prisma.user.count(),

      // Print partners
      prisma.printPartner.count({
        where: { isActive: true },
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.totalAmount || 0);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        activeModels,
        activePrintJobs,
        totalUsers,
        printPartners,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
